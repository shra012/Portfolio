import legacyBlogData from './blog.json';

const blogData = [
  {
    id: 'gemma4_polar_quant',
        title: 'Gemma 4 in 4-Bit: A Practical Guide, with a Polar Quant Teaching Example',
    date: 'April 11, 2026',
        aiSummary: 'A technically honest walkthrough that separates a sign-aware polar quantization teaching example from a production Gemma NF4 deployment path, with validation code and benchmark guidance.',
    content: `
<p>This walkthrough has two goals. <strong>Track A</strong> is a teaching model: a sign-aware polar quantizer that makes compression easy to inspect. <strong>Track B</strong> is a production deployment path: a Gemma-family checkpoint loaded in 4-bit NF4 with bitsandbytes. The two are related, but they are not the same method.</p>
<p><strong>Blunt version:</strong> the custom polar quantizer is a teaching tool for understanding sign-aware compression. The production Gemma example later uses NF4 via bitsandbytes, which is a separate, optimized inference path.</p>
<p>That distinction matters because technical readers will notice if the tutorial method and the deployment method are silently mixed together. I do not want that trust gap in the article. The polar example below is intentionally simple so the math is easy to inspect. The Gemma loading path later is the one you would actually benchmark for serving.</p>

<h3>What This Article Is Not</h3>
<p>This article is not introducing a new state-of-the-art quantization algorithm, and it is not claiming that the custom polar method outperforms optimized 4-bit inference libraries. Its goal is to make quantization easier to reason about, then connect that intuition to a practical deployment workflow.</p>

<h3>What You Will Build</h3>
<p>By the end of this walkthrough, you will understand how to:</p>
<ol>
    <li>Measure why a baseline model is too large for a given deployment target.</li>
    <li>Quantize a small weight vector step by step using a polar, sign-aware method.</li>
    <li>Wrap the same idea in a PyTorch module.</li>
    <li>Validate the toy model comparison correctly with a deep copy.</li>
    <li>Load a Gemma-family model in a production 4-bit NF4 configuration.</li>
    <li>Benchmark the deployment path with concrete metrics instead of vibes.</li>
    <li>Recognize when quantization helps and when it hurts.</li>
</ol>

<h3>1. Why Quantization Helps</h3>
<p>Model weights are often stored as 16-bit or 32-bit numbers. That is fine for training and experiments, but it becomes expensive when you serve many requests. Quantization reduces the precision of those weights so they occupy less memory and often move faster through the compute pipeline.</p>
<p>There is a simple memory intuition worth keeping in mind:</p>
<ul>
    <li><strong>FP32</strong> uses 4 bytes per parameter.</li>
    <li><strong>FP16/BF16</strong> uses 2 bytes per parameter.</li>
    <li><strong>INT8</strong> uses 1 byte per parameter.</li>
    <li><strong>INT4</strong> uses 0.5 bytes per parameter before metadata overhead.</li>
</ul>
<p>That is only the first-order estimate. Real memory use also includes KV cache, activations, runtime metadata, and the backend implementation. Still, the byte math is enough to explain why quantization matters when you move from a notebook to a service.</p>

<h3>2. Install the Tools</h3>
<p>Start with the standard Python stack for transformer inference. The exact package versions will vary, but the shape of the setup is the same.</p>
<pre><code class='language-bash'>pip install torch transformers accelerate bitsandbytes sentencepiece safetensors numpy</code></pre>
<p>If you are on Apple Silicon or a machine without CUDA, you can still follow the article. The loading code may need a different device map or a CPU-friendly path, but the quantization logic stays the same.</p>

<h3>3. Track A: The Polar Quant Teaching Model</h3>
<p>The custom polar quantizer below is a teaching device. It shows how sign-aware scaling works by splitting a tensor into positive and negative parts, then giving each side its own scale. That makes the math inspectable, but it is not the same thing as an optimized serving backend.</p>
<p>If you want the cleanest mental model, think of the polar method as a diagram with code: it explains what compression does to the sign structure of a tensor. It is useful for understanding, experimentation, and communication. It is not the fastest inference path.</p>

<h3>4. A Tiny Polar Quant Example</h3>
<p>Before touching a full model, work through a tiny vector. This is the easiest way to understand what is actually happening.</p>
<pre><code class='language-python'>import numpy as np

weights = np.array([-1.8, -0.9, -0.1, 0.2, 0.6, 1.1, 2.4], dtype=np.float32)

positive = weights[weights &gt;= 0]
negative = -weights[weights &lt; 0]

pos_scale = positive.max() / 7 if positive.size else 1e-8
neg_scale = negative.max() / 7 if negative.size else 1e-8

codes = np.zeros_like(weights, dtype=np.int8)

for index, value in enumerate(weights):
    if value &gt;= 0:
        codes[index] = int(np.clip(np.round(value / pos_scale), 0, 7))
    else:
        codes[index] = -int(np.clip(np.round(abs(value) / neg_scale), 0, 7))

dequantized = np.array([
    code * pos_scale if code &gt;= 0 else code * neg_scale
    for code in codes
], dtype=np.float32)

print('weights     :', weights)
print('pos_scale   :', pos_scale)
print('neg_scale   :', neg_scale)
print('codes       :', codes)
print('dequantized :', dequantized)</code></pre>
<p>Read the output from top to bottom. The positive values share one scale. The negative values share a different scale. That is the polar part of the method. We are not pretending both halves of the distribution are identical.</p>

<p>Here is how to think about the result:</p>
<ul>
  <li><code>-1.8</code> and <code>-0.9</code> are mapped using the negative scale.</li>
  <li><code>0.2</code>, <code>0.6</code>, <code>1.1</code>, and <code>2.4</code> are mapped using the positive scale.</li>
  <li>Values near zero typically survive well because they do not need a large code to stay close.</li>
  <li>Outliers can still hurt, which is why you often quantize by groups instead of by the entire tensor at once.</li>
</ul>

<h3>5. Step By Step With a Hand Calculated Example</h3>
<p>Suppose a row of weights looks like this:</p>
<pre><code class='language-text'>[-1.8, -0.9, -0.1, 0.2, 0.6, 1.1, 2.4]</code></pre>
<p>Now split it into two piles:</p>
<pre><code class='language-text'>negative magnitudes = [1.8, 0.9, 0.1]
positive magnitudes = [0.2, 0.6, 1.1, 2.4]</code></pre>
<p>Then compute the scale for each side. Using 3-bit style buckets for the teaching example gives us a 0 to 7 range.</p>
<pre><code class='language-text'>positive scale = 2.4 / 7 = 0.342857...
negative scale = 1.8 / 7 = 0.257142...</code></pre>
<p>Quantize each value by dividing by the scale for its side, then rounding to the nearest integer bucket.</p>
<pre><code class='language-text'>-1.8  -&gt; -7
-0.9  -&gt; -4
-0.1  -&gt;  0 or -0 depending on implementation
 0.2  -&gt;  1
 0.6  -&gt;  2
 1.1  -&gt;  3
 2.4  -&gt;  7</code></pre>
<p>When you dequantize, you multiply the code by the matching scale. The important idea is not that the reconstruction is perfect. It is that the structure of the signal stays recognizably close to the original tensor.</p>

<h3>6. A Safer Polar Quant Prototype</h3>
<p>The code below is still a teaching prototype, but it is a little more careful around dtype and device handling. That matters because toy snippets become misleading when they only work for one happy path.</p>
<pre><code class='language-python'>from dataclasses import dataclass
import torch
import torch.nn as nn


@dataclass
class PolarQuantState:
    codes: torch.Tensor
    positive_scale: torch.Tensor
    negative_scale: torch.Tensor


def polar_quantize_tensor(weight: torch.Tensor) -&gt; PolarQuantState:
    flat = weight.detach().to(torch.float32)
    device = flat.device

    positive = flat[flat &gt;= 0]
    negative = flat[flat &lt; 0].abs()

    positive_scale = positive.max() / 7 if positive.numel() else torch.tensor(1e-8, device=device)
    negative_scale = negative.max() / 7 if negative.numel() else torch.tensor(1e-8, device=device)

    codes = torch.zeros_like(flat, dtype=torch.int8)

    positive_mask = flat &gt;= 0
    negative_mask = ~positive_mask

    if positive_mask.any():
        positive_codes = torch.round(flat[positive_mask] / positive_scale)
        positive_codes = torch.clamp(positive_codes, 0, 7)
        codes[positive_mask] = positive_codes.to(torch.int8)

    if negative_mask.any():
        negative_codes = torch.round(flat[negative_mask].abs() / negative_scale)
        negative_codes = torch.clamp(negative_codes, 0, 7)
        codes[negative_mask] = -negative_codes.to(torch.int8)

    return PolarQuantState(
        codes=codes.reshape_as(weight),
        positive_scale=positive_scale,
        negative_scale=negative_scale,
    )


def polar_dequantize_tensor(state: PolarQuantState) -&gt; torch.Tensor:
    codes = state.codes.to(torch.float32)
    return torch.where(codes &gt;= 0, codes * state.positive_scale, codes * state.negative_scale)


class PolarQuantLinear(nn.Module):
    def __init__(self, linear: nn.Linear):
        super().__init__()
        quant_state = polar_quantize_tensor(linear.weight)
        self.register_buffer('codes', quant_state.codes)
        self.register_buffer('positive_scale', quant_state.positive_scale)
        self.register_buffer('negative_scale', quant_state.negative_scale)

        if linear.bias is not None:
            self.register_buffer('bias', linear.bias.detach().clone())
        else:
            self.bias = None

    def forward(self, x: torch.Tensor) -&gt; torch.Tensor:
        state = PolarQuantState(
            codes=self.codes,
            positive_scale=self.positive_scale,
            negative_scale=self.negative_scale,
        )
        weight = polar_dequantize_tensor(state)
        return torch.nn.functional.linear(x, weight, self.bias)</code></pre>
<p>This module is written for transparency, not throughput. Because it reconstructs dense weights on every forward pass, it is useful for experimentation but not a substitute for fused low-bit inference kernels.</p>

<h3>7. Grouped Quantization, Not Just Whole-Tensor Quantization</h3>
<p>Whole-tensor scaling is easy to explain, but real models usually behave better when you quantize in groups. That reduces the chance that one outlier ruins the scale for everything else.</p>
<pre><code class='language-python'>def polar_quantize_grouped(weight: torch.Tensor, group_size: int = 64):
    flat = weight.detach().to(torch.float32).flatten()
    codes = torch.zeros_like(flat, dtype=torch.int8)
    positive_scales = []
    negative_scales = []

    for start in range(0, flat.numel(), group_size):
        chunk = flat[start:start + group_size]
        chunk_codes = torch.zeros_like(chunk, dtype=torch.int8)
        positive = chunk[chunk &gt;= 0]
        negative = chunk[chunk &lt; 0].abs()

        positive_scale = positive.max() / 7 if positive.numel() else flat.new_tensor(1e-8)
        negative_scale = negative.max() / 7 if negative.numel() else flat.new_tensor(1e-8)

        positive_mask = chunk &gt;= 0
        negative_mask = ~positive_mask

        if positive_mask.any():
            positive_codes = torch.round(chunk[positive_mask] / positive_scale)
            chunk_codes[positive_mask] = torch.clamp(positive_codes, 0, 7).to(torch.int8)

        if negative_mask.any():
            negative_codes = torch.round(chunk[negative_mask].abs() / negative_scale)
            chunk_codes[negative_mask] = -torch.clamp(negative_codes, 0, 7).to(torch.int8)

        codes[start:start + chunk.numel()] = chunk_codes
        positive_scales.append(positive_scale)
        negative_scales.append(negative_scale)

    return codes.reshape_as(weight), positive_scales, negative_scales</code></pre>
<p>That grouped version is still not a production kernel, but it mirrors the way many real quantization schemes reduce error by letting each block carry its own scale.</p>

<h3>8. Validate The Comparison Correctly</h3>
<p>This is the most important fix in the toy section. If you compare two independently initialized models, you are measuring random initialization, not quantization error. Deep copy the same model before quantizing it.</p>
<pre><code class='language-python'>import copy
import torch
import torch.nn as nn

torch.manual_seed(7)
model = TinyClassifier()

quantized_model = copy.deepcopy(model)
quantized_model = replace_linear_layers(quantized_model)

sample = torch.randn(2, 8)

baseline_output = model(sample)
quantized_output = quantized_model(sample)

print(&quot;baseline output :&quot;, baseline_output)
print(&quot;quantized output:&quot;, quantized_output)
print(&quot;absolute diff   :&quot;, (baseline_output - quantized_output).abs())

max_diff = (baseline_output - quantized_output).abs().max().item()
mean_diff = (baseline_output - quantized_output).abs().mean().item()

print(&quot;max abs diff :&quot;, max_diff)
print(&quot;mean abs diff:&quot;, mean_diff)</code></pre>
<p>That turns a vibe-based comparison into an engineering comparison. The goal is not to pretend the quantized model is identical. The goal is to measure exactly how much deviation the compression introduces.</p>

<h3>9. Track B: Production Gemma Deployment with NF4</h3>
<p>Now we switch to the deployment path. This is the path you would actually benchmark for serving. If you are deploying a Gemma-family checkpoint, replace the model name with the exact checkpoint you intend to serve.</p>
<p>The key point is that this path uses <strong>NF4 via bitsandbytes</strong>. That is a different method from the teaching model above. I am keeping those methods separate on purpose so the article stays technically honest.</p>
<pre><code class='language-python'>import torch
from transformers import AutoTokenizer, AutoModelForCausalLM, BitsAndBytesConfig


model_name = 'replace-with-your-gemma-checkpoint'

quant_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type='nf4',
    bnb_4bit_use_double_quant=True,
    bnb_4bit_compute_dtype=torch.bfloat16,
)

tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(
    model_name,
    device_map='auto',
    quantization_config=quant_config,
)

prompt = 'Explain quantization to a junior engineer in three steps.'
inputs = tokenizer(prompt, return_tensors='pt').to(model.device)

with torch.no_grad():
    output_ids = model.generate(
        **inputs,
        max_new_tokens=120,
        temperature=0.7,
        top_p=0.9,
        do_sample=True,
    )

print(tokenizer.decode(output_ids[0], skip_special_tokens=True))</code></pre>
<p>Even here, the article should stay honest: the production path is the one you benchmark. The polar prototype is for intuition and inspection, not a proof that a custom Python module should replace optimized inference kernels.</p>

<h3>10. Benchmarking And Evidence</h3>
<p>A strong article explains the method. A great one shows how to measure it. Do not publish made-up numbers. Run a baseline and a quantized model on your hardware, then record the same metrics for both:</p>
<ul>
    <li>Model name</li>
    <li>Precision format</li>
    <li>Peak memory</li>
    <li>Time to first token</li>
    <li>Tokens per second</li>
    <li>Quality notes</li>
</ul>
<p>The harness below shows one simple way to collect those numbers. It is intentionally minimal so the article stays reproducible.</p>
<pre><code class='language-python'>import time
from threading import Thread
from transformers import TextIteratorStreamer


def benchmark_generation(model, tokenizer, prompt: str, max_new_tokens: int = 128):
        inputs = tokenizer(prompt, return_tensors='pt').to(model.device)

        if torch.cuda.is_available():
                torch.cuda.reset_peak_memory_stats()
                torch.cuda.synchronize()

        streamer = TextIteratorStreamer(tokenizer, skip_prompt=True, skip_special_tokens=True)
        start = time.perf_counter()
        first_token_time = None

        generation_thread = Thread(
                target=model.generate,
                kwargs={
                        **inputs,
                        'max_new_tokens': max_new_tokens,
                        'temperature': 0.7,
                        'top_p': 0.9,
                        'do_sample': True,
                        'streamer': streamer,
                },
        )
        generation_thread.start()

        generated_text = []
        for chunk in streamer:
                if first_token_time is None and chunk:
                        first_token_time = time.perf_counter()
                generated_text.append(chunk)

        generation_thread.join()
        elapsed = time.perf_counter() - start

        ttft_ms = None if first_token_time is None else (first_token_time - start) * 1000
        tokens_per_second = len(tokenizer(''.join(generated_text), add_special_tokens=False).input_ids) / elapsed if elapsed else 0

        peak_memory_mb = None
        if torch.cuda.is_available():
                peak_memory_mb = torch.cuda.max_memory_allocated() / 1024 / 1024

        return {
                'ttft_ms': ttft_ms,
                'tokens_per_second': tokens_per_second,
                'peak_memory_mb': peak_memory_mb,
                'text': ''.join(generated_text),
        }</code></pre>

<table>
    <tr>
        <th>Setup</th>
        <th>Precision</th>
        <th>Peak Memory</th>
        <th>Time to First Token</th>
        <th>Tokens/sec</th>
        <th>Notes</th>
    </tr>
    <tr>
        <td>Baseline</td>
        <td>BF16 / FP16</td>
        <td>Run locally</td>
        <td>Run locally</td>
        <td>Run locally</td>
        <td>Best quality reference</td>
    </tr>
    <tr>
        <td>Production Gemma</td>
        <td>4-bit NF4</td>
        <td>Run locally</td>
        <td>Run locally</td>
        <td>Run locally</td>
        <td>Check for drift, repetition, and latency gains</td>
    </tr>
</table>
<p>That table is a template, not a claim. The numbers belong in your environment, on your hardware, with your checkpoint. The evidence only counts if you actually measure it.</p>

<h3>11. What To Check In The Outputs</h3>
<p>Quantization should be judged by output quality, speed, and memory, not by gut feeling. A smaller model that gets repetitive, ignores instructions, or destabilizes on long contexts is not a win.</p>
<p>When you compare baseline vs quantized outputs, look for these failure modes:</p>
<ul>
    <li>More repetition than the baseline.</li>
    <li>Worse instruction following.</li>
    <li>Numeric brittleness on structured tasks.</li>
    <li>Degraded code generation.</li>
    <li>Weaker long-context stability.</li>
    <li>Hallucinations on specialized prompts.</li>
</ul>
<p>A simple evaluation loop helps. Use five factual prompts, five instruction-following prompts, five summarization prompts, and five domain-specific prompts. Compare the baseline and quantized versions blind if you can. Then score accuracy, verbosity, repetition, and refusal behavior.</p>

<h3>12. When Polar Quant Works Well</h3>
<p>Polar quantization is a good fit when the original model has a weight distribution with a meaningful positive and negative structure, and when you want to preserve interpretability while compressing aggressively. It works especially well in inference-only systems where the model is not being updated every few seconds.</p>
<p>It is also a good teaching tool. Engineers understand polarity quickly. They can see the split, read the scale, and reason about why a particular row got a certain code. That makes the model easier to debug than a black-box compression pipeline that never explains itself.</p>

<h3>13. When Not To Push Too Hard</h3>
<p>Do not quantize blindly. If your task is extremely sensitive to numeric precision, if your prompts are highly domain-specific, or if you are already serving a tiny model that fits comfortably in memory, the tradeoff may not be worth it.</p>
<p>Another common mistake is overfitting the quantization recipe to a toy prompt. You may see one prompt look great and another collapse. Always test a mix of reasoning, summarization, extraction, and instruction-following tasks before you ship the result.</p>

<h3>14. A Deployment Checklist</h3>
<ol>
  <li>Start from a known baseline model and capture its latency and memory footprint.</li>
  <li>Quantize one layer or one block first, not the entire system at once.</li>
  <li>Validate with a small set of prompts before you move to a larger benchmark suite.</li>
  <li>Compare output quality, token speed, and peak memory together.</li>
  <li>Choose the simplest implementation that satisfies the production requirement.</li>
</ol>

<h3>15. Final Takeaway</h3>
<p>The main lesson is not that one toy quantizer solves deployment. The main lesson is that you should understand the error you introduce, validate it on a small controlled example, and only then move to an optimized inference stack. That process is what makes quantization trustworthy in production.</p>
<p>Gemma-family deployment does not need to be heavy to be useful. The best production strategy is usually the one that keeps the model accurate enough, small enough, and easy enough to operate. The polar quantizer in this article helps you understand the shape of the problem. The NF4 path is the one you should benchmark for real serving.</p>
    `,
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1600',
    tags: ['Gemma', 'Quantization', 'LLM', 'Inference', '4-bit', 'PyTorch'],
    type: 'Article',
  },
  ...legacyBlogData,
];

export default blogData;
