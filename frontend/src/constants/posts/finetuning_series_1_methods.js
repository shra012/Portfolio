const post = {
  id: "finetuning_series_1_methods",
  title: "Fine-tuning explained: 5 ways to teach an AI model",
  date: "November 07, 2026",
  part: 1,
  aiSummary: "A beginner-friendly walk through what fine-tuning is (weights as grids of numbers, loss, gradients, and why training needs far more memory than the model itself), followed by full fine-tuning, LoRA, LoRA-FA, QLoRA and TinyLoRA, each with a hand-checkable toy example, a diagram and short Python code. It ends with the two ways to teach a model, SFT and RL, and a worked GRPO example, setting up the experiments in parts 2 and 3.",
  image: "blog/text2sql-peft/hero_part1.png",
  tags: ["Fine-tuning", "LoRA", "QLoRA", "TinyLoRA", "GRPO", "Reinforcement Learning", "PEFT", "LLM"],
  type: 'Article',
  content: `
<p><em>This is part 1 of 3. <a href='#/blog/finetuning_series_2_how'>Part 2</a> covers how I tested the methods, and <a href='#/blog/finetuning_series_3_results'>part 3</a> has the results.</em></p>
<p><em>About 17 min read.</em></p>
<blockquote><p><strong>In short</strong></p><ul><li>Fine-tuning nudges a model's numbers to lower a loss; gradients and optimizer state make it memory-hungry.</li><li>The five methods differ in which numbers train and how the frozen ones are stored: from 1.54 billion trainable numbers down to 13. A bonus sixth skips training and edits weights by hand.</li><li>SFT learns from the answer key, RL (GRPO) from grading the model's own attempts, which may be why 13 numbers can be enough.</li></ul></blockquote>

<h3>The infographic that started this</h3>
<p>A fine-tuning infographic has been going around LinkedIn. It shows five ways to fine-tune a language model: <strong>full fine-tuning, LoRA, LoRA-FA, QLoRA and TinyLoRA</strong>. For a 70B model it says LoRA trains about 1.2% of the parameters, LoRA-FA about 0.6%, and TinyLoRA only <strong>13 parameters</strong>. A footnote adds that TinyLoRA only works with reinforcement learning, and that supervised fine-tuning needs 100 to 1000 times more.</p>
<p>Thirteen numbers changing how a model behaves? That sounded either brilliant or wrong, so I tried all five myself on one task with one small model.</p>
<p>This series has three parts:</p>
<ul>
<li><strong>Part 1 (this one):</strong> what fine-tuning is, and how each of the five methods works, with tiny examples you can check by hand and short code.</li>
<li><strong><a href='#/blog/finetuning_series_2_how'>Part 2</a>:</strong> how I tested them: text-to-SQL on the BIRD benchmark, the grader, the safety layers and the training setup.</li>
<li><strong><a href='#/blog/finetuning_series_3_results'>Part 3</a>:</strong> the results, what each method cost, and what 13 parameters actually learned. Plus a bonus sixth method: letting an LLM (Claude Opus 5.5) edit the weights directly, with no training.</li>
</ul>
<p>You need a little Python and some school math. Nothing else.</p>

<h3>What a model is: grids of numbers</h3>
<p>A language model is a huge pile of numbers called <strong>weights</strong> (or parameters), arranged in grids called <strong>matrices</strong>. Text goes in as numbers, gets multiplied by these grids again and again, and out comes a guess for the next token (a word or a piece of a word).</p>
<p>Here is the smallest version, a 2&times;2 grid W times an input x:</p>
<pre><code class='language-text'>W = [ 2  1 ]      x = [ 1 ]
    [ 0  3 ]          [ 2 ]

y = W × x
  = [ 2×1 + 1×2 ]   = [ 4 ]
    [ 0×1 + 3×2 ]     [ 6 ]</code></pre>
<p>Each output number is one row of W times x, element by element, added up.</p>
<div style="overflow-x:auto;margin:1.9rem 0"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 330" style="width:100%;min-width:660px;height:auto;display:block" font-family="ui-sans-serif,system-ui,Helvetica,Arial,sans-serif" role="img" aria-label="A layer is a grid of numbers times an input">
  <rect width="1000" height="330" rx="14" fill="#FCFCFB" stroke="#E2E8F0" stroke-width="2"/>
  <text x="28" y="40" font-size="19" font-weight="700" fill="#0b0b0b">A layer is a grid of numbers times an input</text>
  <text x="28" y="64" font-size="14" fill="#52514e">Toy 2×2 example. The highlighted row of W produces the highlighted output.</text>
  <rect x="60.0" y="104.0" width="66.0" height="66.0" rx="0" fill="#EFF4FB" stroke="#94a3b8" stroke-width="1.2"/>
  <text x="93.0" y="144.2" font-size="20" fill="#0b0b0b" text-anchor="middle" font-weight="600">2</text>
  <rect x="126.0" y="104.0" width="66.0" height="66.0" rx="0" fill="#EFF4FB" stroke="#94a3b8" stroke-width="1.2"/>
  <text x="159.0" y="144.2" font-size="20" fill="#0b0b0b" text-anchor="middle" font-weight="600">1</text>
  <rect x="60.0" y="170.0" width="66.0" height="66.0" rx="0" fill="#ffffff" stroke="#94a3b8" stroke-width="1.2"/>
  <text x="93.0" y="210.2" font-size="20" fill="#0b0b0b" text-anchor="middle" font-weight="600">0</text>
  <rect x="126.0" y="170.0" width="66.0" height="66.0" rx="0" fill="#ffffff" stroke="#94a3b8" stroke-width="1.2"/>
  <text x="159.0" y="210.2" font-size="20" fill="#0b0b0b" text-anchor="middle" font-weight="600">3</text>
  <rect x="60.0" y="104.0" width="132.0" height="132.0" rx="2" fill="none" stroke="#94a3b8" stroke-width="2"/>
  <text x="126.0" y="264.0" font-size="14" fill="#0b0b0b" text-anchor="middle" font-weight="700">W (the weights)</text>
  <text x="224.0" y="178.0" font-size="26" fill="#52514e" text-anchor="middle" font-weight="400">×</text>
  <rect x="256.0" y="104.0" width="66.0" height="66.0" rx="0" fill="#E6F6EF" stroke="#94a3b8" stroke-width="1.2"/>
  <text x="289.0" y="144.2" font-size="20" fill="#0b0b0b" text-anchor="middle" font-weight="600">1</text>
  <rect x="256.0" y="170.0" width="66.0" height="66.0" rx="0" fill="#E6F6EF" stroke="#94a3b8" stroke-width="1.2"/>
  <text x="289.0" y="210.2" font-size="20" fill="#0b0b0b" text-anchor="middle" font-weight="600">2</text>
  <rect x="256.0" y="104.0" width="66.0" height="132.0" rx="2" fill="none" stroke="#94a3b8" stroke-width="2"/>
  <text x="289.0" y="264.0" font-size="14" fill="#0b0b0b" text-anchor="middle" font-weight="700">x (input)</text>
  <text x="354.0" y="178.0" font-size="26" fill="#52514e" text-anchor="middle" font-weight="400">=</text>
  <rect x="386.0" y="104.0" width="66.0" height="66.0" rx="0" fill="#EFF4FB" stroke="#94a3b8" stroke-width="1.2"/>
  <text x="419.0" y="144.2" font-size="20" fill="#0b0b0b" text-anchor="middle" font-weight="600">4</text>
  <rect x="386.0" y="170.0" width="66.0" height="66.0" rx="0" fill="#ffffff" stroke="#94a3b8" stroke-width="1.2"/>
  <text x="419.0" y="210.2" font-size="20" fill="#0b0b0b" text-anchor="middle" font-weight="600">6</text>
  <rect x="386.0" y="104.0" width="66.0" height="132.0" rx="2" fill="none" stroke="#94a3b8" stroke-width="2"/>
  <text x="419.0" y="264.0" font-size="14" fill="#0b0b0b" text-anchor="middle" font-weight="700">y (output)</text>
  <text x="560.0" y="118.0" font-size="15" fill="#0b0b0b" text-anchor="start" font-weight="700">How each output number is made</text>
  <text x="560.0" y="150.0" font-size="15" fill="#0b0b0b" text-anchor="start" font-weight="600">Row 1 of W times x:  2×1 + 1×2 = 4</text>
  <text x="560.0" y="178.0" font-size="15" fill="#0b0b0b" text-anchor="start" font-weight="400">Row 2 of W times x:  0×1 + 3×2 = 6</text>
  <text x="560.0" y="220.0" font-size="14" fill="#52514e" text-anchor="start" font-weight="400">Training only ever changes the numbers in W.</text>
  <text x="560.0" y="244.0" font-size="14" fill="#52514e" text-anchor="start" font-weight="400">One real layer of our model is a 1536 × 1536</text>
  <text x="560.0" y="266.0" font-size="14" fill="#52514e" text-anchor="start" font-weight="400">grid: 2,359,296 numbers. The model has 1.54 billion.</text>
</svg></div>
<p>My model, <code>Qwen2.5-Coder-1.5B-Instruct</code>, does the same with much bigger grids. It has 28 layers, each with 7 weight matrices, and one of them alone is 1536&times;1536, or 2,359,296 numbers. Four of the 7 (q, k, v and o) let each token look at the other tokens ("attention"); the other three (gate, up and down) process each token on its own (the "MLP"). <a href='https://jalammar.github.io/illustrated-transformer/' target='_blank' rel='noopener noreferrer'>The Illustrated Transformer</a> explains both. In total the model has <strong>1.54 billion</strong> weights.</p>
<p>The model's "knowledge" is just the values of those numbers. Change them and you change what it writes.</p>

<h3>What training is: nudging numbers</h3>
<p>Training happens in two stages:</p>
<ul>
<li><strong>Pretraining.</strong> Start from random numbers and show the model trillions of tokens. At every position it guesses the next token, and its numbers are nudged so the real one becomes a bit more likely. This costs a fortune and is done once, by the lab that builds the model.</li>
<li><strong>Fine-tuning.</strong> Keep training those finished numbers on a small set of examples from <em>your</em> task. Same math, far less data and cost. That is what this series is about.</li>
</ul>
<p>Both use the same loop: measure how wrong the model is (the <strong>loss</strong>), work out which way each number should move to reduce it (the <strong>gradient</strong>), and move it a small step that way.</p>
<h4>One step, by hand</h4>
<p>A "model" with one weight w predicts <code>w &times; x</code>. We want it to output 2 when the input is 2.</p>
<pre><code class='language-text'>w = 0.5, x = 2, target = 2

prediction = w × x            = 0.5 × 2 = 1.0
error      = prediction - target = 1.0 - 2 = -1.0
loss       = error²               = 1.0

gradient   = 2 × error × x      = 2 × (-1.0) × 2 = -4
new w      = w - 0.1 × gradient  = 0.5 - 0.1 × (-4) = 0.9</code></pre>
<p>The gradient <code>2 &times; error &times; x</code> is the slope of the loss at the current w. It comes from calculus, but you only need its sign and size: a negative slope means increasing w lowers the loss. So w goes up, from 0.5 to 0.9. The 0.1 is the <strong>learning rate</strong>, the step size. Check: 0.9 &times; 2 = 1.8, loss (1.8 - 2)&sup2; = 0.04. One more step: the gradient is 2 &times; (-0.2) &times; 2 = -0.8, so w becomes 0.98 and the prediction 1.96.</p>
<div style="overflow-x:auto;margin:1.9rem 0"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 420" style="width:100%;min-width:660px;height:auto;display:block" font-family="ui-sans-serif,system-ui,Helvetica,Arial,sans-serif" role="img" aria-label="Training is walking downhill on the loss">
  <rect width="1000" height="420" rx="14" fill="#FCFCFB" stroke="#E2E8F0" stroke-width="2"/>
  <text x="28" y="40" font-size="19" font-weight="700" fill="#0b0b0b">Training is walking downhill on the loss</text>
  <text x="28" y="64" font-size="14" fill="#52514e">Loss = (prediction − target)². One weight, two steps of gradient descent, all by hand.</text>
  <line x1="80.0" y1="350.0" x2="540.0" y2="350.0" stroke="#E8ECF2" stroke-width="1"/>
  <text x="70.0" y="354.0" font-size="12" fill="#52514e" text-anchor="end" font-weight="400">0</text>
  <line x1="80.0" y1="287.5" x2="540.0" y2="287.5" stroke="#E8ECF2" stroke-width="1"/>
  <text x="70.0" y="291.5" font-size="12" fill="#52514e" text-anchor="end" font-weight="400">1</text>
  <line x1="80.0" y1="225.0" x2="540.0" y2="225.0" stroke="#E8ECF2" stroke-width="1"/>
  <text x="70.0" y="229.0" font-size="12" fill="#52514e" text-anchor="end" font-weight="400">2</text>
  <line x1="80.0" y1="162.5" x2="540.0" y2="162.5" stroke="#E8ECF2" stroke-width="1"/>
  <text x="70.0" y="166.5" font-size="12" fill="#52514e" text-anchor="end" font-weight="400">3</text>
  <line x1="80.0" y1="100.0" x2="540.0" y2="100.0" stroke="#E8ECF2" stroke-width="1"/>
  <text x="70.0" y="104.0" font-size="12" fill="#52514e" text-anchor="end" font-weight="400">4</text>
  <text x="80.0" y="370.0" font-size="12" fill="#52514e" text-anchor="middle" font-weight="400">0</text>
  <text x="223.8" y="370.0" font-size="12" fill="#52514e" text-anchor="middle" font-weight="400">0.5</text>
  <text x="367.5" y="370.0" font-size="12" fill="#52514e" text-anchor="middle" font-weight="400">1</text>
  <text x="511.2" y="370.0" font-size="12" fill="#52514e" text-anchor="middle" font-weight="400">1.5</text>
  <text x="310.0" y="394.0" font-size="13" fill="#52514e" text-anchor="middle" font-weight="400">weight w</text>
  <text x="36.0" y="86.0" font-size="13" fill="#52514e" text-anchor="start" font-weight="400">loss</text>
  <polyline points="80.0,100.0 82.9,105.0 85.8,109.9 88.6,114.8 91.5,119.6 94.4,124.4 97.2,129.1 100.1,133.8 103.0,138.4 105.9,143.0 108.8,147.5 111.6,152.0 114.5,156.4 117.4,160.8 120.2,165.1 123.1,169.4 126.0,173.6 128.9,177.8 131.8,181.9 134.6,186.0 137.5,190.0 140.4,194.0 143.2,197.9 146.1,201.8 149.0,205.6 151.9,209.4 154.8,213.1 157.6,216.8 160.5,220.4 163.4,224.0 166.2,227.5 169.1,231.0 172.0,234.4 174.9,237.8 177.8,241.1 180.6,244.4 183.5,247.6 186.4,250.8 189.2,253.9 192.1,257.0 195.0,260.0 197.9,263.0 200.8,265.9 203.6,268.8 206.5,271.6 209.4,274.4 212.2,277.1 215.1,279.8 218.0,282.4 220.9,285.0 223.8,287.5 226.6,290.0 229.5,292.4 232.4,294.8 235.2,297.1 238.1,299.4 241.0,301.6 243.9,303.8 246.7,305.9 249.6,308.0 252.5,310.0 255.4,312.0 258.2,313.9 261.1,315.8 264.0,317.6 266.9,319.4 269.8,321.1 272.6,322.8 275.5,324.4 278.4,326.0 281.2,327.5 284.1,329.0 287.0,330.4 289.9,331.8 292.8,333.1 295.6,334.4 298.5,335.6 301.4,336.8 304.2,337.9 307.1,339.0 310.0,340.0 312.9,341.0 315.8,341.9 318.6,342.8 321.5,343.6 324.4,344.4 327.2,345.1 330.1,345.8 333.0,346.4 335.9,347.0 338.8,347.5 341.6,348.0 344.5,348.4 347.4,348.8 350.2,349.1 353.1,349.4 356.0,349.6 358.9,349.8 361.7,349.9 364.6,350.0 367.5,350.0 370.4,350.0 373.2,349.9 376.1,349.8 379.0,349.6 381.9,349.4 384.8,349.1 387.6,348.8 390.5,348.4 393.4,348.0 396.2,347.5 399.1,347.0 402.0,346.4 404.9,345.8 407.7,345.1 410.6,344.4 413.5,343.6 416.4,342.8 419.2,341.9 422.1,341.0 425.0,340.0 427.9,339.0 430.8,337.9 433.6,336.8 436.5,335.6 439.4,334.4 442.2,333.1 445.1,331.8 448.0,330.4 450.9,329.0 453.8,327.5 456.6,326.0 459.5,324.4 462.4,322.8 465.2,321.1 468.1,319.4 471.0,317.6 473.9,315.8 476.7,313.9 479.6,312.0 482.5,310.0 485.4,308.0 488.2,305.9 491.1,303.8 494.0,301.6 496.9,299.4 499.8,297.1 502.6,294.8 505.5,292.4 508.4,290.0 511.2,287.5 514.1,285.0 517.0,282.4 519.9,279.8 522.8,277.1 525.6,274.4 528.5,271.6 531.4,268.8 534.2,265.9 537.1,263.0 540.0,260.0" fill="none" stroke="#94a3b8" stroke-width="2.5"/>
  <line x1="151.9" y1="225.0" x2="295.6" y2="350.0" stroke="#eb6834" stroke-width="2.5"/>
  <text x="145.9" y="219.0" font-size="13" fill="#eb6834" text-anchor="end" font-weight="700">slope −4</text>
  <line x1="231.8" y1="293.5" x2="323.6" y2="338.0" stroke="#2a78d6" stroke-width="2"/>
  <path d="M330.8,341.5 L321.6,342.0 L325.5,334.1 Z" fill="#2a78d6"/>
  <circle cx="223.8" cy="287.5" r="7" fill="#2a78d6" stroke="#ffffff" stroke-width="2"/>
  <circle cx="338.8" cy="347.5" r="7" fill="#2a78d6" stroke="#ffffff" stroke-width="2"/>
  <circle cx="361.7" cy="349.9" r="7" fill="#2a78d6" stroke="#ffffff" stroke-width="2"/>
  <text x="213.8" y="309.5" font-size="13" fill="#0b0b0b" text-anchor="end" font-weight="600">start</text>
  <text x="334.8" y="333.5" font-size="13" fill="#0b0b0b" text-anchor="middle" font-weight="700">1</text>
  <text x="367.7" y="335.9" font-size="13" fill="#0b0b0b" text-anchor="middle" font-weight="700">2</text>
  <text x="590.0" y="112.0" font-size="14" fill="#0b0b0b" text-anchor="start" font-weight="700">Model: prediction = w × x</text>
  <text x="590.0" y="136.0" font-size="14" fill="#52514e" text-anchor="start" font-weight="400">x = 2, target = 2, learning rate = 0.1</text>
  <text x="590.0" y="178.0" font-size="14" fill="#52514e" text-anchor="start" font-weight="400"></text>
  <text x="650.0" y="178.0" font-size="14" fill="#52514e" text-anchor="start" font-weight="400">w</text>
  <text x="720.0" y="178.0" font-size="14" fill="#52514e" text-anchor="start" font-weight="400">prediction</text>
  <text x="820.0" y="178.0" font-size="14" fill="#52514e" text-anchor="start" font-weight="400">loss</text>
  <text x="590.0" y="202.0" font-size="14" fill="#0b0b0b" text-anchor="start" font-weight="600">start</text>
  <text x="650.0" y="202.0" font-size="14" fill="#0b0b0b" text-anchor="start" font-weight="600">0.50</text>
  <text x="720.0" y="202.0" font-size="14" fill="#0b0b0b" text-anchor="start" font-weight="600">1.00</text>
  <text x="820.0" y="202.0" font-size="14" fill="#0b0b0b" text-anchor="start" font-weight="600">1.00</text>
  <text x="590.0" y="226.0" font-size="14" fill="#0b0b0b" text-anchor="start" font-weight="600">step 1</text>
  <text x="650.0" y="226.0" font-size="14" fill="#0b0b0b" text-anchor="start" font-weight="600">0.90</text>
  <text x="720.0" y="226.0" font-size="14" fill="#0b0b0b" text-anchor="start" font-weight="600">1.80</text>
  <text x="820.0" y="226.0" font-size="14" fill="#0b0b0b" text-anchor="start" font-weight="600">0.04</text>
  <text x="590.0" y="250.0" font-size="14" fill="#0b0b0b" text-anchor="start" font-weight="600">step 2</text>
  <text x="650.0" y="250.0" font-size="14" fill="#0b0b0b" text-anchor="start" font-weight="600">0.98</text>
  <text x="720.0" y="250.0" font-size="14" fill="#0b0b0b" text-anchor="start" font-weight="600">1.96</text>
  <text x="820.0" y="250.0" font-size="14" fill="#0b0b0b" text-anchor="start" font-weight="600">0.0016</text>
  <line x1="590.0" y1="184.0" x2="880.0" y2="184.0" stroke="#E2E8F0" stroke-width="1.5"/>
  <text x="590.0" y="290.0" font-size="14" fill="#52514e" text-anchor="start" font-weight="400">The slope (the gradient) says which way</text>
  <text x="590.0" y="314.0" font-size="14" fill="#52514e" text-anchor="start" font-weight="400">is downhill. Each step moves w a little</text>
  <text x="590.0" y="338.0" font-size="14" fill="#52514e" text-anchor="start" font-weight="400">that way: w = w − 0.1 × slope.</text>
</svg></div>
<p>A real model does this for billions of numbers at once. Its "prediction" is a probability for every possible next token, and its loss is small when the right token gets a high probability. Same rule: <strong>nudge the numbers so the right answer becomes more likely.</strong></p>
<h4>Why fine-tune instead of just prompting?</h4>
<p>A better prompt often gets you far. Fine-tuning helps when the model repeats a mistake however you phrase the prompt, when you want a fixed format on every call, or when you want a small, cheap model to do one job well. My base model writes decent SQL but often invents column names. A prompt cannot easily fix that habit. Training can.</p>

<h3>Why fine-tuning is expensive</h3>
<p>Training a 1.54B model needs far more memory than 1.54B numbers. Every trainable number brings luggage: its <strong>gradient</strong> and the <strong>optimizer state</strong>. The usual optimizer, Adam, keeps two running averages per weight (of recent gradients and of their squares) to pick a step size for each. In 16-bit "bf16" format a number takes 2 bytes; Adam's averages are usually 32-bit, 4 bytes each:</p>
<div style="overflow-x:auto;margin:1.9rem 0"><table><thead><tr><th>What</th><th class='num'>Bytes per parameter</th><th class='num'>For 1.54B parameters</th></tr></thead><tbody>
<tr><td>Weights (bf16)</td><td class='num'>2</td><td class='num'>3.1 GB</td></tr>
<tr><td>Gradients (bf16)</td><td class='num'>2</td><td class='num'>3.1 GB</td></tr>
<tr><td>Adam average of gradients (fp32)</td><td class='num'>4</td><td class='num'>6.2 GB</td></tr>
<tr><td>Adam average of squared gradients (fp32)</td><td class='num'>4</td><td class='num'>6.2 GB</td></tr>
<tr><td><strong>Total</strong></td><td class='num'><strong>12</strong></td><td class='num'><strong>18.5 GB</strong></td></tr>
</tbody></table></div>
<p>That is more than my 16 GB GPU before a single example goes in. Many recipes also keep a 32-bit "master copy" of the weights (4 more bytes, about 24.7 GB in total). On top come the <strong>activations</strong>: the intermediate results each layer produces for every token, kept for the backward pass that computes the gradients.</p>
<div style="overflow-x:auto;margin:1.9rem 0"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 360" style="width:100%;min-width:660px;height:auto;display:block" font-family="ui-sans-serif,system-ui,Helvetica,Arial,sans-serif" role="img" aria-label="Memory for full fine-tuning, before any data goes in">
  <rect width="1000" height="360" rx="14" fill="#FCFCFB" stroke="#E2E8F0" stroke-width="2"/>
  <text x="28" y="40" font-size="19" font-weight="700" fill="#0b0b0b">Memory for full fine-tuning, before any data goes in</text>
  <text x="28" y="64" font-size="14" fill="#52514e">Every trainable number needs its own gradient and optimizer state, not just itself.</text>
  <rect x="28.0" y="84.0" width="14.0" height="14.0" rx="3" fill="#2a78d6" stroke="none" stroke-width="1.5"/>
  <text x="48.0" y="96.0" font-size="13" fill="#0b0b0b" text-anchor="start" font-weight="400">weights (bf16)</text>
  <rect x="168.8" y="84.0" width="14.0" height="14.0" rx="3" fill="#eb6834" stroke="none" stroke-width="1.5"/>
  <text x="188.8" y="96.0" font-size="13" fill="#0b0b0b" text-anchor="start" font-weight="400">gradients (bf16)</text>
  <rect x="324.0" y="84.0" width="14.0" height="14.0" rx="3" fill="#1baf7a" stroke="none" stroke-width="1.5"/>
  <text x="344.0" y="96.0" font-size="13" fill="#0b0b0b" text-anchor="start" font-weight="400">Adam&#x27;s 2 running averages</text>
  <text x="236.0" y="158.0" font-size="14" fill="#0b0b0b" text-anchor="end" font-weight="700">Plain Adam</text>
  <text x="236.0" y="177.0" font-size="12.5" fill="#52514e" text-anchor="end" font-weight="400">12 bytes per parameter</text>
  <rect x="250.0" y="140.0" width="98.8" height="40.0" rx="4" fill="#2a78d6" stroke="none" stroke-width="1.5"/>
  <text x="299.4" y="165.0" font-size="13" fill="#ffffff" text-anchor="middle" font-weight="700">3.1</text>
  <rect x="350.8" y="140.0" width="98.8" height="40.0" rx="4" fill="#eb6834" stroke="none" stroke-width="1.5"/>
  <text x="400.1" y="165.0" font-size="13" fill="#ffffff" text-anchor="middle" font-weight="700">3.1</text>
  <rect x="451.5" y="140.0" width="397.8" height="40.0" rx="4" fill="#1baf7a" stroke="none" stroke-width="1.5"/>
  <text x="650.4" y="165.0" font-size="13" fill="#ffffff" text-anchor="middle" font-weight="700">12.3 (fp32)</text>
  <text x="861.2" y="165.0" font-size="14" fill="#0b0b0b" text-anchor="start" font-weight="700">18.5 GB</text>
  <text x="236.0" y="240.0" font-size="14" fill="#0b0b0b" text-anchor="end" font-weight="700">My full fine-tune</text>
  <text x="236.0" y="259.0" font-size="12.5" fill="#52514e" text-anchor="end" font-weight="400">8-bit Adam, paged</text>
  <rect x="250.0" y="222.0" width="98.8" height="40.0" rx="4" fill="#2a78d6" stroke="none" stroke-width="1.5"/>
  <text x="299.4" y="247.0" font-size="13" fill="#ffffff" text-anchor="middle" font-weight="700">3.1</text>
  <rect x="350.8" y="222.0" width="98.8" height="40.0" rx="4" fill="#eb6834" stroke="none" stroke-width="1.5"/>
  <text x="400.1" y="247.0" font-size="13" fill="#ffffff" text-anchor="middle" font-weight="700">3.1</text>
  <rect x="451.5" y="222.0" width="98.8" height="40.0" rx="4" fill="#1baf7a" stroke="none" stroke-width="1.5" fill-opacity="0.45"/>
  <text x="500.9" y="247.0" font-size="13" fill="#0b0b0b" text-anchor="middle" font-weight="700">3.1 (8-bit)</text>
  <text x="562.2" y="247.0" font-size="14" fill="#0b0b0b" text-anchor="start" font-weight="700">6.2 GB on GPU</text>
  <line x1="770.0" y1="120.0" x2="770.0" y2="312.0" stroke="#0b0b0b" stroke-width="2" stroke-dasharray="6 5"/>
  <text x="764.0" y="334.0" font-size="13" fill="#0b0b0b" text-anchor="end" font-weight="600">16 GB GPU</text>
  <text x="455.5" y="290.0" font-size="12.5" fill="#52514e" text-anchor="start" font-weight="400">8-bit Adam state lives in CPU RAM (paged)</text>
  <text x="28.0" y="334.0" font-size="12.5" fill="#52514e" text-anchor="start" font-weight="400">Counts for 1.54B parameters. Activations not shown.</text>
</svg></div>
<p>The five methods are five ways around this bill: train fewer numbers (LoRA, LoRA-FA, TinyLoRA), store the frozen numbers compactly (QLoRA), or squeeze the cost of training everything (my full fine-tuning setup).</p>

<h3>The five methods at a glance</h3>
<p>Each method does something different to a weight matrix W. Blue means trained, grey means frozen (never changes).</p>
<div style="overflow-x:auto;margin:1.9rem 0"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 400" style="width:100%;min-width:660px;height:auto;display:block" font-family="ui-sans-serif,system-ui,Helvetica,Arial,sans-serif" role="img" aria-label="The five methods for one weight matrix W">
  <rect width="1000" height="400" rx="14" fill="#FCFCFB" stroke="#E2E8F0" stroke-width="2"/>
  <text x="28" y="40" font-size="19" font-weight="700" fill="#0b0b0b">The five methods for one weight matrix W</text>
  <text x="28" y="64" font-size="14" fill="#52514e">Counts are for Qwen2.5-Coder-1.5B.</text>
  <rect x="26" y="86" width="178" height="290" rx="12" fill="#ffffff" stroke="#E2E8F0" stroke-width="1.5"/>
  <text x="115.0" y="114.0" font-size="15" fill="#0b0b0b" text-anchor="middle" font-weight="700">Full fine-tune</text>
  <rect x="50" y="140" width="90" height="90" rx="6" fill="#2a78d6" stroke="#2a78d6" stroke-width="1.5"/>
  <text x="95.0" y="190.0" font-size="14" fill="#ffffff" text-anchor="middle" font-weight="700">W</text>
  <text x="115.0" y="316.0" font-size="12.5" fill="#0b0b0b" text-anchor="middle" font-weight="600">W&#x27; = W + ΔW</text>
  <text x="115.0" y="346.0" font-size="13.5" fill="#2a78d6" text-anchor="middle" font-weight="700">1.54B trainable</text>
  <rect x="216" y="86" width="178" height="290" rx="12" fill="#ffffff" stroke="#E2E8F0" stroke-width="1.5"/>
  <text x="305.0" y="114.0" font-size="15" fill="#0b0b0b" text-anchor="middle" font-weight="700">LoRA</text>
  <rect x="240" y="140" width="90" height="90" rx="6" fill="#E5E7EB" stroke="#94a3b8" stroke-width="1.5"/>
  <text x="285.0" y="190.0" font-size="14" fill="#0b0b0b" text-anchor="middle" font-weight="700">W</text>
  <rect x="344" y="140" width="14" height="90" rx="3" fill="#2a78d6"/>
  <text x="351.0" y="134.0" font-size="12" fill="#0b0b0b" text-anchor="middle" font-weight="700">B</text>
  <rect x="240" y="242" width="90" height="14" rx="3" fill="#2a78d6" stroke="#2a78d6"/>
  <text x="338.0" y="254.0" font-size="12" fill="#0b0b0b" text-anchor="start" font-weight="700">A</text>
  <text x="305.0" y="316.0" font-size="12.5" fill="#0b0b0b" text-anchor="middle" font-weight="600">W&#x27; = W + B·A</text>
  <text x="305.0" y="346.0" font-size="13.5" fill="#2a78d6" text-anchor="middle" font-weight="700">73.9M trainable</text>
  <rect x="406" y="86" width="178" height="290" rx="12" fill="#ffffff" stroke="#E2E8F0" stroke-width="1.5"/>
  <text x="495.0" y="114.0" font-size="15" fill="#0b0b0b" text-anchor="middle" font-weight="700">LoRA-FA</text>
  <rect x="430" y="140" width="90" height="90" rx="6" fill="#E5E7EB" stroke="#94a3b8" stroke-width="1.5"/>
  <text x="475.0" y="190.0" font-size="14" fill="#0b0b0b" text-anchor="middle" font-weight="700">W</text>
  <rect x="534" y="140" width="14" height="90" rx="3" fill="#2a78d6"/>
  <text x="541.0" y="134.0" font-size="12" fill="#0b0b0b" text-anchor="middle" font-weight="700">B</text>
  <rect x="430" y="242" width="90" height="14" rx="3" fill="#E5E7EB" stroke="#94a3b8"/>
  <text x="528.0" y="254.0" font-size="12" fill="#0b0b0b" text-anchor="start" font-weight="700">A (frozen)</text>
  <text x="495.0" y="316.0" font-size="12.5" fill="#0b0b0b" text-anchor="middle" font-weight="600">W&#x27; = W + B·A, A frozen</text>
  <text x="495.0" y="346.0" font-size="13.5" fill="#2a78d6" text-anchor="middle" font-weight="700">41.3M trainable</text>
  <rect x="596" y="86" width="178" height="290" rx="12" fill="#ffffff" stroke="#E2E8F0" stroke-width="1.5"/>
  <text x="685.0" y="114.0" font-size="15" fill="#0b0b0b" text-anchor="middle" font-weight="700">QLoRA</text>
  <rect x="620" y="140" width="90" height="90" rx="6" fill="#E5E7EB" stroke="#94a3b8" stroke-width="1.5"/>
  <line x1="642.5" y1="140" x2="642.5" y2="230" stroke="#94a3b8" stroke-width="1"/>
  <line x1="620" y1="162.5" x2="710" y2="162.5" stroke="#94a3b8" stroke-width="1"/>
  <line x1="665.0" y1="140" x2="665.0" y2="230" stroke="#94a3b8" stroke-width="1"/>
  <line x1="620" y1="185.0" x2="710" y2="185.0" stroke="#94a3b8" stroke-width="1"/>
  <line x1="687.5" y1="140" x2="687.5" y2="230" stroke="#94a3b8" stroke-width="1"/>
  <line x1="620" y1="207.5" x2="710" y2="207.5" stroke="#94a3b8" stroke-width="1"/>
  <text x="665.0" y="190.0" font-size="14" fill="#0b0b0b" text-anchor="middle" font-weight="700">W 4-bit</text>
  <rect x="724" y="140" width="14" height="90" rx="3" fill="#2a78d6"/>
  <text x="731.0" y="134.0" font-size="12" fill="#0b0b0b" text-anchor="middle" font-weight="700">B</text>
  <rect x="620" y="242" width="90" height="14" rx="3" fill="#2a78d6" stroke="#2a78d6"/>
  <text x="718.0" y="254.0" font-size="12" fill="#0b0b0b" text-anchor="start" font-weight="700">A</text>
  <text x="685.0" y="316.0" font-size="12.5" fill="#0b0b0b" text-anchor="middle" font-weight="600">W 4-bit + B·A</text>
  <text x="685.0" y="346.0" font-size="13.5" fill="#2a78d6" text-anchor="middle" font-weight="700">73.9M trainable</text>
  <rect x="786" y="86" width="178" height="290" rx="12" fill="#ffffff" stroke="#E2E8F0" stroke-width="1.5"/>
  <text x="875.0" y="114.0" font-size="15" fill="#0b0b0b" text-anchor="middle" font-weight="700">TinyLoRA</text>
  <rect x="810" y="140" width="90" height="90" rx="6" fill="#E5E7EB" stroke="#94a3b8" stroke-width="1.5"/>
  <text x="855.0" y="190.0" font-size="14" fill="#0b0b0b" text-anchor="middle" font-weight="700">W</text>
  <rect x="914" y="140" width="12" height="11" rx="2" fill="#2a78d6"/>
  <rect x="914" y="153" width="12" height="11" rx="2" fill="#2a78d6"/>
  <rect x="914" y="166" width="12" height="11" rx="2" fill="#2a78d6"/>
  <rect x="914" y="179" width="12" height="11" rx="2" fill="#2a78d6"/>
  <text x="920.0" y="206.0" font-size="13" fill="#0b0b0b" text-anchor="middle" font-weight="700">v</text>
  <text x="810.0" y="254.0" font-size="12" fill="#52514e" text-anchor="start" font-weight="400">U, Σ, V, P frozen</text>
  <text x="875.0" y="316.0" font-size="12.5" fill="#0b0b0b" text-anchor="middle" font-weight="600">W + UΣ(Σ vᵢPᵢ)Vᵀ</text>
  <text x="875.0" y="346.0" font-size="13.5" fill="#2a78d6" text-anchor="middle" font-weight="700">13 trainable</text>
  <rect x="620" y="52" width="14" height="14" rx="3" fill="#2a78d6"/>
  <text x="640.0" y="64.0" font-size="13" fill="#0b0b0b" text-anchor="start" font-weight="400">trained</text>
  <rect x="720" y="52" width="14" height="14" rx="3" fill="#E5E7EB" stroke="#94a3b8"/>
  <text x="740.0" y="64.0" font-size="13" fill="#0b0b0b" text-anchor="start" font-weight="400">frozen</text>
</svg></div>
<p>For each method below: the idea, the code and what changes. The table at the end says when to use which. The toys use one 4&times;4 weight matrix W with 16 numbers.</p>

<h3>1. Full fine-tuning: change everything</h3>
<h4>The idea</h4>
<p>Every number is trainable (the all-blue card): all 16 in the toy, all 1,543,714,304 in our model. It is the simplest method and, in principle, the most powerful.</p>
<pre><code class='language-text'>W' = W + ΔW      (ΔW can be anything, all 16 numbers trained)</code></pre>
<h4>The code</h4>
<p>To fit it in 16 GB I used three tricks: bf16 weights with no 32-bit master copy; an 8-bit "paged" Adam from the <code>bitsandbytes</code> library, which stores each average in 1 byte instead of 4 and can move them to CPU memory when the GPU fills up; and <strong>gradient checkpointing</strong>, which throws away most activations and recomputes them when needed, trading time for memory.</p>
<pre><code class='language-python'>import torch
import bitsandbytes as bnb
from transformers import AutoModelForCausalLM

name = "Qwen/Qwen2.5-Coder-1.5B-Instruct"
model = AutoModelForCausalLM.from_pretrained(name, dtype=torch.bfloat16).to("cuda")
model.gradient_checkpointing_enable(gradient_checkpointing_kwargs={"use_reentrant": False})
model.config.use_cache = False

for p in model.parameters():          # every weight is trainable
    p.requires_grad_(True)

opt = bnb.optim.PagedAdamW8bit(model.parameters(), lr=1e-5)

# one training step (batch = token ids + labels, explained further down)
loss = model(**batch).loss
loss.backward()                        # a gradient for all 1.54B weights
opt.step()                             # nudge all 1.54B weights
opt.zero_grad()</code></pre>
<h4>What it changes</h4>
<p>In memory: 3.1 GB of weights plus 3.1 GB of gradients on the GPU, and 3.1 GB of 8-bit optimizer state allowed to spill into CPU RAM. On disk: a whole new 2.9 GB model per fine-tune.</p>
<p>Skipping the master copy has a hidden cost: bf16 keeps only 2 to 3 significant digits, so tiny updates can round away to nothing. <a href='#/blog/finetuning_series_3_results'>Part 3</a> shows how much this hit my run.</p>

<h3>2. LoRA: learn a thin patch</h3>
<h4>The idea</h4>
<p>LoRA (Low-Rank Adaptation) freezes W and learns a <strong>patch</strong> that gets added to it:</p>
<pre><code class='language-text'>W' = W + B × A</code></pre>
<p>The trick is that B and A are thin. With <strong>rank</strong> 1, B is a 4&times;1 column and A a 1&times;4 row, and their product is a full 4&times;4 grid:</p>
<pre><code class='language-text'>B = [ 1, 2, 0, -1 ]      (a column)
A = [ 0.5, 0, 0, 0.5 ]   (a row)

B × A =
[  0.5  0  0   0.5 ]     row 1 = 1  × A
[  1.0  0  0   1.0 ]     row 2 = 2  × A
[  0.0  0  0   0.0 ]     row 3 = 0  × A
[ -0.5  0  0  -0.5 ]     row 4 = -1 × A</code></pre>
<p>So 8 trainable numbers (4 + 4) change all 16. The bet behind LoRA is that fine-tuning needs a simple change, so a thin patch is enough.</p>
<div style="overflow-x:auto;margin:1.9rem 0"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 380" style="width:100%;min-width:660px;height:auto;display:block" font-family="ui-sans-serif,system-ui,Helvetica,Arial,sans-serif" role="img" aria-label="LoRA: a thin patch added to a frozen matrix">
  <rect width="1000" height="380" rx="14" fill="#FCFCFB" stroke="#E2E8F0" stroke-width="2"/>
  <text x="28" y="40" font-size="19" font-weight="700" fill="#0b0b0b">LoRA: a thin patch added to a frozen matrix</text>
  <text x="28" y="64" font-size="14" fill="#52514e">Rank 1 toy: a 4×1 column B times a 1×4 row A makes a full 4×4 grid.</text>
  <rect x="36.0" y="108.0" width="42.0" height="42.0" rx="0" fill="#E5E7EB" stroke="#94a3b8" stroke-width="1.2"/>
  <text x="57.0" y="133.7" font-size="13" fill="#0b0b0b" text-anchor="middle" font-weight="600">0.2</text>
  <rect x="78.0" y="108.0" width="42.0" height="42.0" rx="0" fill="#E5E7EB" stroke="#94a3b8" stroke-width="1.2"/>
  <text x="99.0" y="133.7" font-size="13" fill="#0b0b0b" text-anchor="middle" font-weight="600">−0.1</text>
  <rect x="120.0" y="108.0" width="42.0" height="42.0" rx="0" fill="#E5E7EB" stroke="#94a3b8" stroke-width="1.2"/>
  <text x="141.0" y="133.7" font-size="13" fill="#0b0b0b" text-anchor="middle" font-weight="600">0.4</text>
  <rect x="162.0" y="108.0" width="42.0" height="42.0" rx="0" fill="#E5E7EB" stroke="#94a3b8" stroke-width="1.2"/>
  <text x="183.0" y="133.7" font-size="13" fill="#0b0b0b" text-anchor="middle" font-weight="600">0</text>
  <rect x="36.0" y="150.0" width="42.0" height="42.0" rx="0" fill="#E5E7EB" stroke="#94a3b8" stroke-width="1.2"/>
  <text x="57.0" y="175.7" font-size="13" fill="#0b0b0b" text-anchor="middle" font-weight="600">0.3</text>
  <rect x="78.0" y="150.0" width="42.0" height="42.0" rx="0" fill="#E5E7EB" stroke="#94a3b8" stroke-width="1.2"/>
  <text x="99.0" y="175.7" font-size="13" fill="#0b0b0b" text-anchor="middle" font-weight="600">0.5</text>
  <rect x="120.0" y="150.0" width="42.0" height="42.0" rx="0" fill="#E5E7EB" stroke="#94a3b8" stroke-width="1.2"/>
  <text x="141.0" y="175.7" font-size="13" fill="#0b0b0b" text-anchor="middle" font-weight="600">−0.2</text>
  <rect x="162.0" y="150.0" width="42.0" height="42.0" rx="0" fill="#E5E7EB" stroke="#94a3b8" stroke-width="1.2"/>
  <text x="183.0" y="175.7" font-size="13" fill="#0b0b0b" text-anchor="middle" font-weight="600">0.1</text>
  <rect x="36.0" y="192.0" width="42.0" height="42.0" rx="0" fill="#E5E7EB" stroke="#94a3b8" stroke-width="1.2"/>
  <text x="57.0" y="217.7" font-size="13" fill="#0b0b0b" text-anchor="middle" font-weight="600">−0.4</text>
  <rect x="78.0" y="192.0" width="42.0" height="42.0" rx="0" fill="#E5E7EB" stroke="#94a3b8" stroke-width="1.2"/>
  <text x="99.0" y="217.7" font-size="13" fill="#0b0b0b" text-anchor="middle" font-weight="600">0.2</text>
  <rect x="120.0" y="192.0" width="42.0" height="42.0" rx="0" fill="#E5E7EB" stroke="#94a3b8" stroke-width="1.2"/>
  <text x="141.0" y="217.7" font-size="13" fill="#0b0b0b" text-anchor="middle" font-weight="600">0.1</text>
  <rect x="162.0" y="192.0" width="42.0" height="42.0" rx="0" fill="#E5E7EB" stroke="#94a3b8" stroke-width="1.2"/>
  <text x="183.0" y="217.7" font-size="13" fill="#0b0b0b" text-anchor="middle" font-weight="600">0.3</text>
  <rect x="36.0" y="234.0" width="42.0" height="42.0" rx="0" fill="#E5E7EB" stroke="#94a3b8" stroke-width="1.2"/>
  <text x="57.0" y="259.7" font-size="13" fill="#0b0b0b" text-anchor="middle" font-weight="600">0</text>
  <rect x="78.0" y="234.0" width="42.0" height="42.0" rx="0" fill="#E5E7EB" stroke="#94a3b8" stroke-width="1.2"/>
  <text x="99.0" y="259.7" font-size="13" fill="#0b0b0b" text-anchor="middle" font-weight="600">−0.3</text>
  <rect x="120.0" y="234.0" width="42.0" height="42.0" rx="0" fill="#E5E7EB" stroke="#94a3b8" stroke-width="1.2"/>
  <text x="141.0" y="259.7" font-size="13" fill="#0b0b0b" text-anchor="middle" font-weight="600">0.2</text>
  <rect x="162.0" y="234.0" width="42.0" height="42.0" rx="0" fill="#E5E7EB" stroke="#94a3b8" stroke-width="1.2"/>
  <text x="183.0" y="259.7" font-size="13" fill="#0b0b0b" text-anchor="middle" font-weight="600">0.6</text>
  <rect x="36.0" y="108.0" width="168.0" height="168.0" rx="2" fill="none" stroke="#94a3b8" stroke-width="2"/>
  <text x="120.0" y="302.0" font-size="14" fill="#0b0b0b" text-anchor="middle" font-weight="700">W, frozen</text>
  <text x="120.0" y="322.0" font-size="12.5" fill="#52514e" text-anchor="middle" font-weight="400">16 numbers</text>
  <text x="226.0" y="201.0" font-size="26" fill="#52514e" text-anchor="middle" font-weight="400">+</text>
  <rect x="246.0" y="108.0" width="42.0" height="42.0" rx="0" fill="#2a78d6" stroke="#2a78d6" stroke-width="1.2"/>
  <text x="267.0" y="134.0" font-size="14" fill="#ffffff" text-anchor="middle" font-weight="600">1</text>
  <rect x="246.0" y="150.0" width="42.0" height="42.0" rx="0" fill="#2a78d6" stroke="#2a78d6" stroke-width="1.2"/>
  <text x="267.0" y="176.0" font-size="14" fill="#ffffff" text-anchor="middle" font-weight="600">2</text>
  <rect x="246.0" y="192.0" width="42.0" height="42.0" rx="0" fill="#2a78d6" stroke="#2a78d6" stroke-width="1.2"/>
  <text x="267.0" y="218.0" font-size="14" fill="#ffffff" text-anchor="middle" font-weight="600">0</text>
  <rect x="246.0" y="234.0" width="42.0" height="42.0" rx="0" fill="#2a78d6" stroke="#2a78d6" stroke-width="1.2"/>
  <text x="267.0" y="260.0" font-size="14" fill="#ffffff" text-anchor="middle" font-weight="600">−1</text>
  <rect x="246.0" y="108.0" width="42.0" height="168.0" rx="2" fill="none" stroke="#2a78d6" stroke-width="2"/>
  <text x="267.0" y="302.0" font-size="14" fill="#0b0b0b" text-anchor="middle" font-weight="700">B</text>
  <text x="267.0" y="322.0" font-size="12.5" fill="#52514e" text-anchor="middle" font-weight="400">4, trained</text>
  <text x="310.0" y="201.0" font-size="24" fill="#52514e" text-anchor="middle" font-weight="400">×</text>
  <rect x="330.0" y="108.0" width="42.0" height="42.0" rx="0" fill="#2a78d6" stroke="#2a78d6" stroke-width="1.2"/>
  <text x="351.0" y="134.0" font-size="14" fill="#ffffff" text-anchor="middle" font-weight="600">0.5</text>
  <rect x="372.0" y="108.0" width="42.0" height="42.0" rx="0" fill="#2a78d6" stroke="#2a78d6" stroke-width="1.2"/>
  <text x="393.0" y="134.0" font-size="14" fill="#ffffff" text-anchor="middle" font-weight="600">0</text>
  <rect x="414.0" y="108.0" width="42.0" height="42.0" rx="0" fill="#2a78d6" stroke="#2a78d6" stroke-width="1.2"/>
  <text x="435.0" y="134.0" font-size="14" fill="#ffffff" text-anchor="middle" font-weight="600">0</text>
  <rect x="456.0" y="108.0" width="42.0" height="42.0" rx="0" fill="#2a78d6" stroke="#2a78d6" stroke-width="1.2"/>
  <text x="477.0" y="134.0" font-size="14" fill="#ffffff" text-anchor="middle" font-weight="600">0.5</text>
  <rect x="330.0" y="108.0" width="168.0" height="42.0" rx="2" fill="none" stroke="#2a78d6" stroke-width="2"/>
  <text x="414.0" y="174.0" font-size="14" fill="#0b0b0b" text-anchor="middle" font-weight="700">A</text>
  <text x="414.0" y="194.0" font-size="12.5" fill="#52514e" text-anchor="middle" font-weight="400">4, trained</text>
  <text x="520.0" y="201.0" font-size="26" fill="#52514e" text-anchor="middle" font-weight="400">=</text>
  <rect x="540.0" y="108.0" width="42.0" height="42.0" rx="0" fill="#EFF4FB" stroke="#2a78d6" stroke-width="1.2"/>
  <text x="561.0" y="133.7" font-size="13" fill="#0b0b0b" text-anchor="middle" font-weight="600">0.5</text>
  <rect x="582.0" y="108.0" width="42.0" height="42.0" rx="0" fill="#EFF4FB" stroke="#2a78d6" stroke-width="1.2"/>
  <text x="603.0" y="133.7" font-size="13" fill="#0b0b0b" text-anchor="middle" font-weight="600">0</text>
  <rect x="624.0" y="108.0" width="42.0" height="42.0" rx="0" fill="#EFF4FB" stroke="#2a78d6" stroke-width="1.2"/>
  <text x="645.0" y="133.7" font-size="13" fill="#0b0b0b" text-anchor="middle" font-weight="600">0</text>
  <rect x="666.0" y="108.0" width="42.0" height="42.0" rx="0" fill="#EFF4FB" stroke="#2a78d6" stroke-width="1.2"/>
  <text x="687.0" y="133.7" font-size="13" fill="#0b0b0b" text-anchor="middle" font-weight="600">0.5</text>
  <rect x="540.0" y="150.0" width="42.0" height="42.0" rx="0" fill="#EFF4FB" stroke="#2a78d6" stroke-width="1.2"/>
  <text x="561.0" y="175.7" font-size="13" fill="#0b0b0b" text-anchor="middle" font-weight="600">1</text>
  <rect x="582.0" y="150.0" width="42.0" height="42.0" rx="0" fill="#EFF4FB" stroke="#2a78d6" stroke-width="1.2"/>
  <text x="603.0" y="175.7" font-size="13" fill="#0b0b0b" text-anchor="middle" font-weight="600">0</text>
  <rect x="624.0" y="150.0" width="42.0" height="42.0" rx="0" fill="#EFF4FB" stroke="#2a78d6" stroke-width="1.2"/>
  <text x="645.0" y="175.7" font-size="13" fill="#0b0b0b" text-anchor="middle" font-weight="600">0</text>
  <rect x="666.0" y="150.0" width="42.0" height="42.0" rx="0" fill="#EFF4FB" stroke="#2a78d6" stroke-width="1.2"/>
  <text x="687.0" y="175.7" font-size="13" fill="#0b0b0b" text-anchor="middle" font-weight="600">1</text>
  <rect x="540.0" y="192.0" width="42.0" height="42.0" rx="0" fill="#EFF4FB" stroke="#2a78d6" stroke-width="1.2"/>
  <text x="561.0" y="217.7" font-size="13" fill="#0b0b0b" text-anchor="middle" font-weight="600">0</text>
  <rect x="582.0" y="192.0" width="42.0" height="42.0" rx="0" fill="#EFF4FB" stroke="#2a78d6" stroke-width="1.2"/>
  <text x="603.0" y="217.7" font-size="13" fill="#0b0b0b" text-anchor="middle" font-weight="600">0</text>
  <rect x="624.0" y="192.0" width="42.0" height="42.0" rx="0" fill="#EFF4FB" stroke="#2a78d6" stroke-width="1.2"/>
  <text x="645.0" y="217.7" font-size="13" fill="#0b0b0b" text-anchor="middle" font-weight="600">0</text>
  <rect x="666.0" y="192.0" width="42.0" height="42.0" rx="0" fill="#EFF4FB" stroke="#2a78d6" stroke-width="1.2"/>
  <text x="687.0" y="217.7" font-size="13" fill="#0b0b0b" text-anchor="middle" font-weight="600">0</text>
  <rect x="540.0" y="234.0" width="42.0" height="42.0" rx="0" fill="#EFF4FB" stroke="#2a78d6" stroke-width="1.2"/>
  <text x="561.0" y="259.7" font-size="13" fill="#0b0b0b" text-anchor="middle" font-weight="600">−0.5</text>
  <rect x="582.0" y="234.0" width="42.0" height="42.0" rx="0" fill="#EFF4FB" stroke="#2a78d6" stroke-width="1.2"/>
  <text x="603.0" y="259.7" font-size="13" fill="#0b0b0b" text-anchor="middle" font-weight="600">0</text>
  <rect x="624.0" y="234.0" width="42.0" height="42.0" rx="0" fill="#EFF4FB" stroke="#2a78d6" stroke-width="1.2"/>
  <text x="645.0" y="259.7" font-size="13" fill="#0b0b0b" text-anchor="middle" font-weight="600">0</text>
  <rect x="666.0" y="234.0" width="42.0" height="42.0" rx="0" fill="#EFF4FB" stroke="#2a78d6" stroke-width="1.2"/>
  <text x="687.0" y="259.7" font-size="13" fill="#0b0b0b" text-anchor="middle" font-weight="600">−0.5</text>
  <rect x="540.0" y="108.0" width="168.0" height="168.0" rx="2" fill="none" stroke="#2a78d6" stroke-width="2"/>
  <text x="624.0" y="302.0" font-size="14" fill="#0b0b0b" text-anchor="middle" font-weight="700">B·A, the patch</text>
  <text x="624.0" y="322.0" font-size="12.5" fill="#52514e" text-anchor="middle" font-weight="400">16 changes, computed</text>
  <text x="742.0" y="124.0" font-size="15" fill="#0b0b0b" text-anchor="start" font-weight="700">W&#x27; = W + B·A</text>
  <text x="742.0" y="146.0" font-size="13" fill="#0b0b0b" text-anchor="start" font-weight="400"></text>
  <text x="742.0" y="168.0" font-size="13.5" fill="#52514e" text-anchor="start" font-weight="400">8 trained numbers move</text>
  <text x="742.0" y="190.0" font-size="13.5" fill="#52514e" text-anchor="start" font-weight="400">all 16 numbers of W.</text>
  <text x="742.0" y="212.0" font-size="13" fill="#0b0b0b" text-anchor="start" font-weight="400"></text>
  <text x="742.0" y="234.0" font-size="13.5" fill="#0b0b0b" text-anchor="start" font-weight="700">Real layer, rank 64:</text>
  <text x="742.0" y="256.0" font-size="13.5" fill="#52514e" text-anchor="start" font-weight="400">W has 2,359,296 numbers;</text>
  <text x="742.0" y="278.0" font-size="13.5" fill="#52514e" text-anchor="start" font-weight="400">B and A have 196,608.</text>
</svg></div>
<p>The rank is the patch's thickness: rank 2 makes B 4&times;2 and A 2&times;4. In the real model, a rank-64 patch on a 1536&times;1536 matrix has 64 &times; (1536 + 1536) = <strong>196,608</strong> trainable numbers instead of 2,359,296. Over all 7 matrices in all 28 layers that is <strong>73,859,072</strong>, 4.8% of the model.</p>
<p>Two details:</p>
<ul>
<li><strong>B starts at zero</strong> (A starts small and random), so B &times; A = 0 on step one and training starts exactly at the original model.</li>
<li><strong>Alpha</strong> is a volume knob: the patch is scaled by alpha / rank, here 128 / 64 = 2.</li>
</ul>
<h4>The code</h4>
<p>The idea comes from the <a href='https://arxiv.org/abs/2106.09685' target='_blank' rel='noopener noreferrer'>LoRA paper</a>, and Hugging Face's <a href='https://huggingface.co/docs/peft' target='_blank' rel='noopener noreferrer'>PEFT library</a> does all the wrapping for you:</p>
<pre><code class='language-python'>from peft import LoraConfig, get_peft_model

config = LoraConfig(
    r=64,                 # rank: how thick the patch is
    lora_alpha=128,       # the patch is scaled by alpha / r = 2
    lora_dropout=0.05,
    target_modules=["q_proj", "k_proj", "v_proj", "o_proj",     # attention
                    "gate_proj", "up_proj", "down_proj"],       # MLP
    bias="none",
    task_type="CAUSAL_LM",
)
model = AutoModelForCausalLM.from_pretrained(name, dtype=torch.bfloat16).to("cuda")
model = get_peft_model(model, config)       # freezes W, adds B and A everywhere
model.print_trainable_parameters()
# trainable params: 73,859,072 || all params: 1,617,573,376 || trainable%: 4.5660

opt = torch.optim.AdamW([p for p in model.parameters() if p.requires_grad], lr=2e-4)
# ... same training loop as before ...

model.save_pretrained("lora_adapter")       # saves only B and A
merged = model.merge_and_unload()           # or bake W + B×A into a plain model</code></pre>
<p>Why 4.57% here and 4.8% earlier? <code>peft</code> divides by the total <em>including</em> the patch. 4.8% is relative to the original 1.54B.</p>
<h4>What it changes</h4>
<p>The frozen W needs no gradient or optimizer state, so Adam tracks 73.9M numbers instead of 1.54B, about 21 times fewer. On disk: a 282 MB adapter (32-bit; 148 MB in 16-bit) that you can load on the base model, swap for another, or merge in with <code>merge_and_unload()</code>. A merged model runs as fast as the original: same grids, new values. The catch: you must pick a rank, alpha and which matrices to patch, and too small a rank limits what it can learn.</p>

<h3>3. LoRA-FA: freeze half the patch</h3>
<h4>The idea</h4>
<p>LoRA-FA ("frozen A", from the <a href='https://arxiv.org/abs/2308.03303' target='_blank' rel='noopener noreferrer'>LoRA-FA paper</a>) keeps A at its random start forever (the card with B blue, A grey). Only B trains: 4 numbers in the toy. A random A acts like a fixed set of random "views" of the input, and B learns how to combine them.</p>
<pre><code class='language-text'>W' = W + B × A₀     (A₀ random and frozen, only B trains)</code></pre>
<h4>The code</h4>
<p>Exactly the LoRA setup, plus three lines:</p>
<pre><code class='language-python'>model = get_peft_model(model, config)       # same LoraConfig as above
for n, p in model.named_parameters():
    if "lora_A" in n:
        p.requires_grad_(False)             # A stays at its random start; B (zeros) trains</code></pre>
<h4>What it changes</h4>
<p>Trainable numbers drop to <strong>41,287,680</strong> (2.7%), so there is a bit less room to learn. It is not a halving because B is the bigger piece in the MLP: for a matrix mapping 1536 numbers to 8960, B is 8960&times;64 and A only 64&times;1536.</p>
<p>It also saves activation memory: A's gradient needs each token's full input x (1536 or 8960 numbers), B's only the 64 numbers of <code>A &times; x</code>.</p>

<h3>4. QLoRA: LoRA on a compressed model</h3>
<h4>The idea</h4>
<p>QLoRA (<a href='https://arxiv.org/abs/2305.14314' target='_blank' rel='noopener noreferrer'>QLoRA paper</a>) trains the same LoRA patch, but stores the frozen W in <strong>4 bits</strong> per number instead of 16.</p>
<p>4 bits allow only 2<sup>4</sup> = 16 values (16 bits allow 65,536), so every weight is rounded to the nearest of 16 levels. With levels evenly spaced from -1 to 1 (-1, -0.867, -0.733, ..., 0.2, ..., 1):</p>
<pre><code class='language-text'>original     rounded to the nearest level
  0.137  -&gt;   0.200
 -0.402  -&gt;  -0.467
  0.951  -&gt;   1.000</code></pre>
<p>Some precision is lost, but the weights take a quarter of the memory.</p>
<div style="overflow-x:auto;margin:1.9rem 0"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 360" style="width:100%;min-width:660px;height:auto;display:block" font-family="ui-sans-serif,system-ui,Helvetica,Arial,sans-serif" role="img" aria-label="4-bit numbers: round every weight to one of 16 levels">
  <rect width="1000" height="360" rx="14" fill="#FCFCFB" stroke="#E2E8F0" stroke-width="2"/>
  <text x="28" y="40" font-size="19" font-weight="700" fill="#0b0b0b">4-bit numbers: round every weight to one of 16 levels</text>
  <text x="28" y="64" font-size="14" fill="#52514e">4 bits can hold 2⁴ = 16 different values. Each weight snaps to its nearest level.</text>
  <text x="28.0" y="106.0" font-size="14" fill="#0b0b0b" text-anchor="start" font-weight="700">16 evenly spaced levels between −1 and 1</text>
  <line x1="80.0" y1="190.0" x2="920.0" y2="190.0" stroke="#94a3b8" stroke-width="2"/>
  <circle cx="80.0" cy="190" r="5" fill="#ffffff" stroke="#52514e" stroke-width="1.5"/>
  <circle cx="136.0" cy="190" r="5" fill="#ffffff" stroke="#52514e" stroke-width="1.5"/>
  <circle cx="192.0" cy="190" r="5" fill="#ffffff" stroke="#52514e" stroke-width="1.5"/>
  <circle cx="248.0" cy="190" r="5" fill="#ffffff" stroke="#52514e" stroke-width="1.5"/>
  <circle cx="304.0" cy="190" r="5" fill="#ffffff" stroke="#52514e" stroke-width="1.5"/>
  <circle cx="360.0" cy="190" r="5" fill="#ffffff" stroke="#52514e" stroke-width="1.5"/>
  <circle cx="416.0" cy="190" r="5" fill="#ffffff" stroke="#52514e" stroke-width="1.5"/>
  <circle cx="472.0" cy="190" r="5" fill="#ffffff" stroke="#52514e" stroke-width="1.5"/>
  <circle cx="528.0" cy="190" r="5" fill="#ffffff" stroke="#52514e" stroke-width="1.5"/>
  <circle cx="584.0" cy="190" r="5" fill="#ffffff" stroke="#52514e" stroke-width="1.5"/>
  <circle cx="640.0" cy="190" r="5" fill="#ffffff" stroke="#52514e" stroke-width="1.5"/>
  <circle cx="696.0" cy="190" r="5" fill="#ffffff" stroke="#52514e" stroke-width="1.5"/>
  <circle cx="752.0" cy="190" r="5" fill="#ffffff" stroke="#52514e" stroke-width="1.5"/>
  <circle cx="808.0" cy="190" r="5" fill="#ffffff" stroke="#52514e" stroke-width="1.5"/>
  <circle cx="864.0" cy="190" r="5" fill="#ffffff" stroke="#52514e" stroke-width="1.5"/>
  <circle cx="920.0" cy="190" r="5" fill="#ffffff" stroke="#52514e" stroke-width="1.5"/>
  <text x="80.0" y="216.0" font-size="12.5" fill="#52514e" text-anchor="middle" font-weight="400">−1</text>
  <text x="920.0" y="216.0" font-size="12.5" fill="#52514e" text-anchor="middle" font-weight="400">1</text>
  <circle cx="557.5" cy="138" r="6" fill="#eb6834"/>
  <text x="557.5" y="126.0" font-size="13" fill="#eb6834" text-anchor="middle" font-weight="700">0.137</text>
  <line x1="557.5" y1="145.0" x2="579.9" y2="175.4" stroke="#52514e" stroke-width="1.5"/>
  <path d="M584.0,181.0 L576.8,177.6 L583.0,173.1 Z" fill="#52514e"/>
  <circle cx="584.0" cy="190" r="6" fill="#2a78d6"/>
  <text x="584.0" y="216.0" font-size="13" fill="#2a78d6" text-anchor="middle" font-weight="700">0.2</text>
  <circle cx="331.2" cy="138" r="6" fill="#eb6834"/>
  <text x="331.2" y="126.0" font-size="13" fill="#eb6834" text-anchor="middle" font-weight="700">−0.402</text>
  <line x1="331.2" y1="145.0" x2="308.2" y2="175.4" stroke="#52514e" stroke-width="1.5"/>
  <path d="M304.0,181.0 L305.1,173.1 L311.3,177.7 Z" fill="#52514e"/>
  <circle cx="304.0" cy="190" r="6" fill="#2a78d6"/>
  <text x="304.0" y="216.0" font-size="13" fill="#2a78d6" text-anchor="middle" font-weight="700">−0.467</text>
  <circle cx="899.4" cy="138" r="6" fill="#eb6834"/>
  <text x="899.4" y="126.0" font-size="13" fill="#eb6834" text-anchor="middle" font-weight="700">0.951</text>
  <line x1="899.4" y1="145.0" x2="916.5" y2="174.9" stroke="#52514e" stroke-width="1.5"/>
  <path d="M920.0,181.0 L913.2,176.8 L919.9,173.0 Z" fill="#52514e"/>
  <circle cx="920.0" cy="190" r="6" fill="#2a78d6"/>
  <text x="920.0" y="216.0" font-size="13" fill="#2a78d6" text-anchor="middle" font-weight="700">1</text>
  <text x="28.0" y="260.0" font-size="14" fill="#0b0b0b" text-anchor="start" font-weight="700">NF4: the same 16 levels, packed closer together near 0 where most weights are</text>
  <line x1="80.0" y1="300.0" x2="920.0" y2="300.0" stroke="#94a3b8" stroke-width="2"/>
  <circle cx="80.0" cy="300" r="5" fill="#2a78d6" stroke="#ffffff" stroke-width="1"/>
  <circle cx="207.6" cy="300" r="5" fill="#2a78d6" stroke="#ffffff" stroke-width="1"/>
  <circle cx="279.5" cy="300" r="5" fill="#2a78d6" stroke="#ffffff" stroke-width="1"/>
  <circle cx="334.1" cy="300" r="5" fill="#2a78d6" stroke="#ffffff" stroke-width="1"/>
  <circle cx="380.6" cy="300" r="5" fill="#2a78d6" stroke="#ffffff" stroke-width="1"/>
  <circle cx="422.4" cy="300" r="5" fill="#2a78d6" stroke="#ffffff" stroke-width="1"/>
  <circle cx="461.7" cy="300" r="5" fill="#2a78d6" stroke="#ffffff" stroke-width="1"/>
  <circle cx="500.0" cy="300" r="5" fill="#2a78d6" stroke="#ffffff" stroke-width="1"/>
  <circle cx="533.4" cy="300" r="5" fill="#2a78d6" stroke="#ffffff" stroke-width="1"/>
  <circle cx="567.6" cy="300" r="5" fill="#2a78d6" stroke="#ffffff" stroke-width="1"/>
  <circle cx="603.4" cy="300" r="5" fill="#2a78d6" stroke="#ffffff" stroke-width="1"/>
  <circle cx="641.9" cy="300" r="5" fill="#2a78d6" stroke="#ffffff" stroke-width="1"/>
  <circle cx="685.1" cy="300" r="5" fill="#2a78d6" stroke="#ffffff" stroke-width="1"/>
  <circle cx="736.3" cy="300" r="5" fill="#2a78d6" stroke="#ffffff" stroke-width="1"/>
  <circle cx="803.7" cy="300" r="5" fill="#2a78d6" stroke="#ffffff" stroke-width="1"/>
  <circle cx="920.0" cy="300" r="5" fill="#2a78d6" stroke="#ffffff" stroke-width="1"/>
  <text x="80.0" y="326.0" font-size="12.5" fill="#52514e" text-anchor="middle" font-weight="400">−1</text>
  <text x="500.0" y="326.0" font-size="12.5" fill="#52514e" text-anchor="middle" font-weight="400">0</text>
  <text x="920.0" y="326.0" font-size="12.5" fill="#52514e" text-anchor="middle" font-weight="400">1</text>
  <circle cx="670" cy="102" r="6" fill="#eb6834"/>
  <text x="680.0" y="106.0" font-size="12.5" fill="#52514e" text-anchor="start" font-weight="400">original weight</text>
  <circle cx="800" cy="102" r="6" fill="#2a78d6"/>
  <text x="810.0" y="106.0" font-size="12.5" fill="#52514e" text-anchor="start" font-weight="400">stored level</text>
</svg></div>
<p>Real QLoRA is smarter than even spacing:</p>
<ul>
<li><strong>NF4</strong> ("4-bit NormalFloat") packs more levels near zero, where most weights are.</li>
<li>Weights are stored in <strong>blocks</strong> of 64, each with its own scale, so the levels stretch to fit that block. <strong>Double quantization</strong> compresses those scales too.</li>
<li>For the math, each block is unpacked to <strong>bf16</strong> on the fly, then thrown away.</li>
</ul>
<p>Only W is compressed. The patch you train stays in full precision.</p>
<h4>The code</h4>
<p>The 4-bit storage comes from the <a href='https://huggingface.co/docs/bitsandbytes' target='_blank' rel='noopener noreferrer'>bitsandbytes</a> library:</p>
<pre><code class='language-python'>from transformers import BitsAndBytesConfig
from peft import get_peft_model, prepare_model_for_kbit_training

bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",              # bell-curve levels
    bnb_4bit_use_double_quant=True,         # compress the block scales too
    bnb_4bit_compute_dtype=torch.bfloat16,  # unpack to bf16 for the math
)
model = AutoModelForCausalLM.from_pretrained(
    name, quantization_config=bnb_config, dtype=torch.bfloat16, device_map={"": 0})
model = prepare_model_for_kbit_training(
    model, use_gradient_checkpointing=True,
    gradient_checkpointing_kwargs={"use_reentrant": False})
model = get_peft_model(model, config)       # the same r=64 LoraConfig as LoRA</code></pre>
<h4>What it changes</h4>
<p>The base model shrinks from about 3.1 GB to roughly 1 GB on the GPU (a few parts, like the token embedding table, stay in 16-bit). Trainable numbers and the saved adapter match LoRA: 73,859,072 and 282 MB.</p>
<p>The catch: it is slower, since every forward pass unpacks the 4-bit weights. And the patch was trained against a rounded W, so it matters whether you serve it on the 4-bit model or a 16-bit one.</p>

<h3>5. TinyLoRA: steer the strongest directions</h3>
<p>TinyLoRA comes from the paper <a href='https://arxiv.org/abs/2602.04118' target='_blank' rel='noopener noreferrer'>Learning to Reason in 13 Parameters</a> (Morris et al., 2026, FAIR at Meta, Cornell and CMU). They report Qwen2.5-7B-Instruct reaching 91% on GSM8K grade-school math with 13 trained numbers. To explain how, I need one idea first: SVD.</p>
<h4>SVD in plain words</h4>
<p><a href='https://en.wikipedia.org/wiki/Singular_value_decomposition' target='_blank' rel='noopener noreferrer'>SVD</a> (singular value decomposition) breaks any matrix into <strong>directions</strong>, each with a <strong>strength</strong>, like a song split into instruments, each with a volume.</p>
<ul>
<li><code>[[3, 0], [0, 1]]</code> is "strength 3 along x, plus strength 1 along y". Two directions, one loud and one quiet.</li>
<li><code>[[2, 4], [1, 2]]</code> has only one direction. It equals the column [2, 1] times the row [1, 2]. Check: 2&times;1 = 2, 2&times;2 = 4, 1&times;1 = 1, 1&times;2 = 2.</li>
</ul>
<p>SVD writes any matrix as <code>W = U &Sigma; V&#7488;</code>: U and V hold the directions, &Sigma; (Sigma) the strengths, loudest first. In big weight matrices a few directions are loud and most are quiet.</p>
<h4>The idea</h4>
<p>TinyLoRA freezes the top r = 2 directions of each weight matrix and learns a tiny 2&times;2 "mixer" R that changes how they combine:</p>
<pre><code class='language-text'>W' = W + U Σ R Vᵀ              (U, Σ, V: top 2 directions of W, frozen)
R  = v₁P₁ + v₂P₂ + ... + vᵤPᵤ   (P: fixed random 2×2 grids, frozen)</code></pre>
<p>R is built from a short vector v of u numbers, each scaling a fixed random 2&times;2 grid P. Only v trains.</p>
<p>A toy you can check by hand, with u = 2. Take <code>W = [[3, 0], [0, 1]]</code>. Its directions are just x and y, so U and V are plain identity grids (the do-nothing grid: 1s on the diagonal, 0s elsewhere, so multiplying by it changes nothing) and &Sigma; holds the strengths 3 and 1. Pick two fixed grids and a v:</p>
<pre><code class='language-text'>P₁ = [[1, 0], [0, -1]]     P₂ = [[0, 1], [1, 0]]     v = [0.1, -0.3]

R  = 0.1 × P₁ - 0.3 × P₂   = [[ 0.1, -0.3],
                                  [-0.3, -0.1]]

ΔW = U Σ R Vᵀ = Σ R         = [[ 0.3, -0.9],     (row 1 × 3)
                                  [-0.3, -0.1]]     (row 2 × 1)

W' = W + ΔW                 = [[ 3.3, -0.9],
                                  [-0.3,  0.9]]</code></pre>
<p>Two numbers moved all four entries, and the loud direction (strength 3) changed three times as much.</p>
<p>The last trick is <strong>weight tying</strong>: each adapted matrix has its own U, &Sigma;, V and random P grids, but they all share one v. With u = 13 across all 196 matrices (7 per layer &times; 28 layers), the whole model has <strong>13 trainable numbers</strong>. And v starts at zero, so training starts exactly at the original model.</p>
<div style="overflow-x:auto;margin:1.9rem 0"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 420" style="width:100%;min-width:660px;height:auto;display:block" font-family="ui-sans-serif,system-ui,Helvetica,Arial,sans-serif" role="img" aria-label="TinyLoRA: steer the strongest directions with 13 numbers">
  <rect width="1000" height="420" rx="14" fill="#FCFCFB" stroke="#E2E8F0" stroke-width="2"/>
  <text x="28" y="40" font-size="19" font-weight="700" fill="#0b0b0b">TinyLoRA: steer the strongest directions with 13 numbers</text>
  <text x="28" y="64" font-size="14" fill="#52514e">Blue is trained or computed from trained numbers. Everything grey is frozen.</text>
  <rect x="36.0" y="112.0" width="150.0" height="150.0" rx="6" fill="#E5E7EB" stroke="#94a3b8" stroke-width="1.5"/>
  <text x="111.0" y="193.0" font-size="18" fill="#0b0b0b" text-anchor="middle" font-weight="700">W</text>
  <text x="111.0" y="288.0" font-size="14" fill="#0b0b0b" text-anchor="middle" font-weight="700">W, frozen</text>
  <text x="210.0" y="196.0" font-size="26" fill="#52514e" text-anchor="middle" font-weight="400">+</text>
  <rect x="232.0" y="112.0" width="22.0" height="150.0" rx="3" fill="#E5E7EB" stroke="#94a3b8" stroke-width="1.5"/>
  <rect x="254.0" y="112.0" width="22.0" height="150.0" rx="3" fill="#E5E7EB" stroke="#94a3b8" stroke-width="1.5"/>
  <text x="254.0" y="288.0" font-size="14" fill="#0b0b0b" text-anchor="middle" font-weight="700">UΣ</text>
  <text x="254.0" y="306.0" font-size="12.5" fill="#52514e" text-anchor="middle" font-weight="400">frozen</text>
  <rect x="290.0" y="112.0" width="22.0" height="22.0" rx="2" fill="#EFF4FB" stroke="#2a78d6" stroke-width="1.5"/>
  <rect x="312.0" y="112.0" width="22.0" height="22.0" rx="2" fill="#EFF4FB" stroke="#2a78d6" stroke-width="1.5"/>
  <rect x="290.0" y="134.0" width="22.0" height="22.0" rx="2" fill="#EFF4FB" stroke="#2a78d6" stroke-width="1.5"/>
  <rect x="312.0" y="134.0" width="22.0" height="22.0" rx="2" fill="#EFF4FB" stroke="#2a78d6" stroke-width="1.5"/>
  <text x="312.0" y="102.0" font-size="14" fill="#0b0b0b" text-anchor="middle" font-weight="700">R</text>
  <rect x="348.0" y="112.0" width="150.0" height="22.0" rx="3" fill="#E5E7EB" stroke="#94a3b8" stroke-width="1.5"/>
  <rect x="348.0" y="134.0" width="150.0" height="22.0" rx="3" fill="#E5E7EB" stroke="#94a3b8" stroke-width="1.5"/>
  <text x="423.0" y="178.0" font-size="14" fill="#0b0b0b" text-anchor="middle" font-weight="700">Vᵀ, frozen</text>
  <text x="423.0" y="102.0" font-size="12.5" fill="#52514e" text-anchor="middle" font-weight="400">the 2 strongest directions of W</text>
  <rect x="191.0" y="330.0" width="22.0" height="22.0" rx="3" fill="#2a78d6" stroke="none" stroke-width="1.5"/>
  <rect x="216.0" y="330.0" width="22.0" height="22.0" rx="3" fill="#2a78d6" stroke="none" stroke-width="1.5"/>
  <rect x="241.0" y="330.0" width="22.0" height="22.0" rx="3" fill="#2a78d6" stroke="none" stroke-width="1.5"/>
  <rect x="266.0" y="330.0" width="22.0" height="22.0" rx="3" fill="#2a78d6" stroke="none" stroke-width="1.5"/>
  <rect x="291.0" y="330.0" width="22.0" height="22.0" rx="3" fill="#2a78d6" stroke="none" stroke-width="1.5"/>
  <rect x="316.0" y="330.0" width="22.0" height="22.0" rx="3" fill="#2a78d6" stroke="none" stroke-width="1.5"/>
  <rect x="341.0" y="330.0" width="22.0" height="22.0" rx="3" fill="#2a78d6" stroke="none" stroke-width="1.5"/>
  <rect x="366.0" y="330.0" width="22.0" height="22.0" rx="3" fill="#2a78d6" stroke="none" stroke-width="1.5"/>
  <rect x="391.0" y="330.0" width="22.0" height="22.0" rx="3" fill="#2a78d6" stroke="none" stroke-width="1.5"/>
  <rect x="416.0" y="330.0" width="22.0" height="22.0" rx="3" fill="#2a78d6" stroke="none" stroke-width="1.5"/>
  <rect x="441.0" y="330.0" width="22.0" height="22.0" rx="3" fill="#2a78d6" stroke="none" stroke-width="1.5"/>
  <rect x="466.0" y="330.0" width="22.0" height="22.0" rx="3" fill="#2a78d6" stroke="none" stroke-width="1.5"/>
  <rect x="491.0" y="330.0" width="22.0" height="22.0" rx="3" fill="#2a78d6" stroke="none" stroke-width="1.5"/>
  <text x="352.0" y="376.0" font-size="13.5" fill="#0b0b0b" text-anchor="middle" font-weight="700">v: 13 trained numbers, one copy shared by all 196 matrices</text>
  <line x1="312.0" y1="324.0" x2="312.0" y2="172.0" stroke="#2a78d6" stroke-width="2"/>
  <path d="M312.0,164.0 L316.4,172.0 L307.6,172.0 Z" fill="#2a78d6"/>
  <text x="326.0" y="266.0" font-size="13.5" fill="#0b0b0b" text-anchor="start" font-weight="600">R = v₁P₁ + v₂P₂ + … + v₁₃P₁₃</text>
  <text x="326.0" y="286.0" font-size="12.5" fill="#52514e" text-anchor="start" font-weight="400">P₁ … P₁₃: fixed random 2×2 grids</text>
  <text x="538.0" y="124.0" font-size="15" fill="#0b0b0b" text-anchor="start" font-weight="700">W&#x27; = W + UΣ R Vᵀ</text>
  <text x="538.0" y="146.0" font-size="13" fill="#0b0b0b" text-anchor="start" font-weight="400"></text>
  <text x="538.0" y="168.0" font-size="13.5" fill="#52514e" text-anchor="start" font-weight="400">SVD finds the strongest</text>
  <text x="538.0" y="190.0" font-size="13.5" fill="#52514e" text-anchor="start" font-weight="400">directions of W (frozen).</text>
  <text x="538.0" y="212.0" font-size="13.5" fill="#52514e" text-anchor="start" font-weight="400">R, a 2×2 mixer, re-weights</text>
  <text x="538.0" y="234.0" font-size="13.5" fill="#52514e" text-anchor="start" font-weight="400">how they combine.</text>
  <text x="538.0" y="256.0" font-size="13" fill="#0b0b0b" text-anchor="start" font-weight="400"></text>
  <text x="538.0" y="278.0" font-size="13.5" fill="#52514e" text-anchor="start" font-weight="400">v starts at 0, so R = 0</text>
  <text x="538.0" y="300.0" font-size="13.5" fill="#52514e" text-anchor="start" font-weight="400">and W&#x27; = W at step 0.</text>
</svg></div>
<h4>The code</h4>
<p>There is no official code, so I wrote my own. This sketch never builds the big patch: it projects the input onto the 2 directions, mixes them with R, and maps back out.</p>
<pre><code class='language-python'>import torch, torch.nn as nn

class TinyLoRALinear(nn.Module):
    def __init__(self, base, v, P):                       # base: a frozen nn.Linear
        super().__init__()
        self.base, self.v, self.P = base, v, P            # v: the shared 13 numbers, P: 13 fixed random 2x2 grids
        U, S, Vh = torch.linalg.svd(base.weight.detach(), full_matrices=False)
        self.US, self.V = U[:, :2] * S[:2], Vh[:2].T      # top-2 directions x strengths, frozen

    def forward(self, x):
        R = torch.einsum("u,uij-&gt;ij", self.v, self.P)     # R = v1*P1 + ... + v13*P13
        return self.base(x) + ((x @ self.V) @ R.T) @ self.US.T

v = nn.Parameter(torch.zeros(13))                         # starts at 0: no change at step 1
layers = nn.ModuleList(TinyLoRALinear(nn.Linear(1536, 1536).requires_grad_(False), v, torch.randn(13, 2, 2))
                       for _ in range(3))                 # the real model has 196
print(sum(p.numel() for p in layers.parameters() if p.requires_grad))   # 13</code></pre>
<p>PyTorch counts a shared parameter once, so it prints 13. The full version (wrapping all 196 matrices, saving and merging) is in the repo's <code>src/t2s/tinylora.py</code>.</p>
<h4>What it changes</h4>
<p>On disk: 13 numbers plus a random seed (my file is 60 KB because it also stores the P grids). The optimizer needs almost no memory.</p>
<p>But training is <strong>not</strong> 13 numbers' worth of work. Every step still runs the full 1.5B model forward and backward, because v's gradient flows through every layer. You save optimizer memory and disk space, not compute.</p>
<p>And 13 numbers can only hold so much. The paper says TinyLoRA works with reinforcement learning, while supervised training needs 100 to 1000 times bigger updates. Which brings us to the two ways of teaching.</p>

<h3>Two ways to teach: SFT and RL</h3>
<p>The methods above decide <em>which</em> numbers change. A separate choice is <em>what signal</em> tells them how.</p>
<ul>
<li><strong>Supervised fine-tuning (SFT)</strong> is studying with the answer key: show the model a question and the exact correct answer, and make those tokens more likely.</li>
<li><strong>Reinforcement learning (RL)</strong> is practice with a grader: the model tries, something checks the answer, and the model does more of what worked. Nobody shows it the correct answer.</li>
</ul>
<h4>SFT: loss only on the answer</h4>
<p>An SFT example is a prompt followed by its answer, and only the answer is graded. At each answer token the loss is <code>-log(probability the model gave to the correct token)</code>. If the model gave "students" a probability of 0.2 after "FROM", the loss there is -log(0.2) = 1.61; at 0.9 it would be 0.105. A probability near 1 gives a loss near 0, and a small probability gives a big loss; that is all the log does here. Training pushes those probabilities up.</p>
<div style="overflow-x:auto;margin:1.9rem 0"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 280" style="width:100%;min-width:660px;height:auto;display:block" font-family="ui-sans-serif,system-ui,Helvetica,Arial,sans-serif" role="img" aria-label="SFT: learn from the answer key, one token at a time">
  <rect width="1000" height="280" rx="14" fill="#FCFCFB" stroke="#E2E8F0" stroke-width="2"/>
  <text x="28" y="40" font-size="19" font-weight="700" fill="#0b0b0b">SFT: learn from the answer key, one token at a time</text>
  <text x="28" y="64" font-size="14" fill="#52514e">Grey tokens are context. Blue tokens are what the model is graded on.</text>
  <rect x="36.0" y="118.0" width="53.6" height="44.0" rx="6" fill="#E5E7EB" stroke="#94a3b8" stroke-width="1.5"/>
  <text x="62.8" y="146.0" font-size="14" fill="#0b0b0b" text-anchor="middle" font-weight="700">How</text>
  <rect x="97.6" y="118.0" width="62.8" height="44.0" rx="6" fill="#E5E7EB" stroke="#94a3b8" stroke-width="1.5"/>
  <text x="129.0" y="146.0" font-size="14" fill="#0b0b0b" text-anchor="middle" font-weight="700">many</text>
  <rect x="168.4" y="118.0" width="99.6" height="44.0" rx="6" fill="#E5E7EB" stroke="#94a3b8" stroke-width="1.5"/>
  <text x="218.2" y="146.0" font-size="14" fill="#0b0b0b" text-anchor="middle" font-weight="700">students</text>
  <rect x="276.0" y="118.0" width="35.2" height="44.0" rx="6" fill="#E5E7EB" stroke="#94a3b8" stroke-width="1.5"/>
  <text x="293.6" y="146.0" font-size="14" fill="#0b0b0b" text-anchor="middle" font-weight="700">?</text>
  <rect x="319.2" y="118.0" width="81.2" height="44.0" rx="6" fill="#2a78d6" stroke="#2a78d6" stroke-width="1.5"/>
  <text x="359.8" y="146.0" font-size="14" fill="#ffffff" text-anchor="middle" font-weight="700">SELECT</text>
  <rect x="408.4" y="118.0" width="72.0" height="44.0" rx="6" fill="#2a78d6" stroke="#2a78d6" stroke-width="1.5"/>
  <text x="444.4" y="146.0" font-size="14" fill="#ffffff" text-anchor="middle" font-weight="700">COUNT</text>
  <rect x="488.4" y="118.0" width="53.6" height="44.0" rx="6" fill="#2a78d6" stroke="#2a78d6" stroke-width="1.5"/>
  <text x="515.2" y="146.0" font-size="14" fill="#ffffff" text-anchor="middle" font-weight="700">(*)</text>
  <rect x="550.0" y="118.0" width="62.8" height="44.0" rx="6" fill="#2a78d6" stroke="#2a78d6" stroke-width="1.5"/>
  <text x="581.4" y="146.0" font-size="14" fill="#ffffff" text-anchor="middle" font-weight="700">FROM</text>
  <rect x="620.8" y="118.0" width="99.6" height="44.0" rx="6" fill="#2a78d6" stroke="#2a78d6" stroke-width="1.5"/>
  <text x="670.6" y="146.0" font-size="14" fill="#ffffff" text-anchor="middle" font-weight="700">students</text>
  <rect x="728.4" y="118.0" width="72.0" height="44.0" rx="6" fill="#2a78d6" stroke="#2a78d6" stroke-width="1.5"/>
  <text x="764.4" y="146.0" font-size="14" fill="#ffffff" text-anchor="middle" font-weight="700">&lt;end&gt;</text>
  <line x1="36.0" y1="180.0" x2="311.2" y2="180.0" stroke="#94a3b8" stroke-width="2"/>
  <line x1="36.0" y1="174.0" x2="36.0" y2="180.0" stroke="#94a3b8" stroke-width="2"/>
  <line x1="311.2" y1="174.0" x2="311.2" y2="180.0" stroke="#94a3b8" stroke-width="2"/>
  <line x1="319.2" y1="180.0" x2="800.4" y2="180.0" stroke="#2a78d6" stroke-width="2"/>
  <line x1="319.2" y1="174.0" x2="319.2" y2="180.0" stroke="#2a78d6" stroke-width="2"/>
  <line x1="800.4" y1="174.0" x2="800.4" y2="180.0" stroke="#2a78d6" stroke-width="2"/>
  <text x="173.6" y="204.0" font-size="13.5" fill="#0b0b0b" text-anchor="middle" font-weight="700">prompt: label −100, ignored</text>
  <text x="173.6" y="224.0" font-size="12.5" fill="#52514e" text-anchor="middle" font-weight="400">the model reads it, no loss</text>
  <text x="559.8" y="204.0" font-size="13.5" fill="#0b0b0b" text-anchor="middle" font-weight="700">answer: loss counted on every token</text>
  <text x="559.8" y="224.0" font-size="12.5" fill="#52514e" text-anchor="middle" font-weight="400">&quot;after FROM, write students&quot;</text>
</svg></div>
<p>In code, the prompt's labels are set to -100, a special value the loss skips:</p>
<pre><code class='language-python'>def tokenize_example(tok, messages, answer):
    prompt_ids = tok.apply_chat_template(messages, add_generation_prompt=True, tokenize=True)
    answer_ids = tok(answer + "&lt;|im_end|&gt;", add_special_tokens=False)["input_ids"]
    input_ids = prompt_ids + answer_ids
    labels = [-100] * len(prompt_ids) + answer_ids    # -100 = not graded
    return input_ids, labels</code></pre>
<p>Every answer token is a lesson ("after FROM, write students"): a lot of very specific information.</p>
<h4>RL: practice with a grader</h4>
<p>RL needs a <strong>reward</strong>: a number saying how good an attempt was. For text-to-SQL the grader is easy to build: run the model's SQL and the correct SQL on the database and compare the rows. Same rows: reward 1. Different rows or an error: reward 0.</p>
<pre><code class='language-python'>def reward(model_sql, gold_sql, db_path):
    return 1.0 if same_rows(db_path, model_sql, gold_sql) else 0.0</code></pre>
<p>That line hides a lot (running untrusted SQL safely, time limits, fair comparison). <a href='#/blog/finetuning_series_2_how'>Part 2</a> covers the real grader.</p>

<h3>GRPO, step by step</h3>
<p>The TinyLoRA paper uses an RL method called <strong>GRPO</strong> (Group Relative Policy Optimization), from the <a href='https://arxiv.org/abs/2402.03300' target='_blank' rel='noopener noreferrer'>DeepSeekMath paper</a>. The idea is simple: for one question, sample several answers, grade them, and compare each to the group.</p>
<h4>A worked example</h4>
<p>Let the model sample 4 answers to one question (with some randomness turned on) and grade each:</p>
<pre><code class='language-text'>answer 1: correct     -&gt; reward 1
answer 2: wrong rows  -&gt; reward 0
answer 3: SQL error   -&gt; reward 0
answer 4: correct     -&gt; reward 1

rewards = [1, 0, 0, 1]</code></pre>
<p>Now compare each answer to the group:</p>
<pre><code class='language-text'>mean   = (1 + 0 + 0 + 1) / 4 = 0.5
spread (standard deviation): every reward is 0.5 away from the mean, so 0.5

advantage = (reward - mean) / spread
answer 1: (1 - 0.5) / 0.5 = +1
answer 2: (0 - 0.5) / 0.5 = -1
answer 3: (0 - 0.5) / 0.5 = -1
answer 4: (1 - 0.5) / 0.5 = +1</code></pre>
<div style="overflow-x:auto;margin:1.9rem 0"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 430" style="width:100%;min-width:660px;height:auto;display:block" font-family="ui-sans-serif,system-ui,Helvetica,Arial,sans-serif" role="img" aria-label="GRPO: grade a group of answers, then compare each to the group">
  <rect width="1000" height="430" rx="14" fill="#FCFCFB" stroke="#E2E8F0" stroke-width="2"/>
  <text x="28" y="40" font-size="19" font-weight="700" fill="#0b0b0b">GRPO: grade a group of answers, then compare each to the group</text>
  <text x="28" y="64" font-size="14" fill="#52514e">One question, 4 sampled answers. Arrows show the advantage: distance from the group mean.</text>
  <line x1="60.0" y1="300.0" x2="580.0" y2="300.0" stroke="#94a3b8" stroke-width="1.5"/>
  <line x1="60.0" y1="240.0" x2="580.0" y2="240.0" stroke="#0b0b0b" stroke-width="2" stroke-dasharray="6 5"/>
  <text x="588.0" y="244.0" font-size="13" fill="#0b0b0b" text-anchor="start" font-weight="700">group mean 0.5</text>
  <text x="52.0" y="184.0" font-size="12" fill="#52514e" text-anchor="end" font-weight="400">1</text>
  <text x="52.0" y="304.0" font-size="12" fill="#52514e" text-anchor="end" font-weight="400">0</text>
  <line x1="60.0" y1="180.0" x2="580.0" y2="180.0" stroke="#E8ECF2" stroke-width="1"/>
  <text x="120.0" y="102.0" font-size="14" fill="#0b0b0b" text-anchor="middle" font-weight="700">Answer 1</text>
  <text x="120.0" y="122.0" font-size="12.5" fill="#1baf7a" text-anchor="middle" font-weight="700">correct</text>
  <rect x="82.0" y="180.0" width="44.0" height="120.0" rx="3" fill="#EFF4FB" stroke="#2a78d6" stroke-width="1.5"/>
  <line x1="146.0" y1="240.0" x2="146.0" y2="194.0" stroke="#1baf7a" stroke-width="3.5"/>
  <path d="M146.0,182.0 L152.6,194.0 L139.4,194.0 Z" fill="#1baf7a"/>
  <text x="120.0" y="324.0" font-size="13" fill="#0b0b0b" text-anchor="middle" font-weight="600">reward 1</text>
  <text x="120.0" y="346.0" font-size="13.5" fill="#1baf7a" text-anchor="middle" font-weight="700">advantage +1</text>
  <text x="120.0" y="366.0" font-size="12.5" fill="#52514e" text-anchor="middle" font-weight="400">push up</text>
  <text x="250.0" y="102.0" font-size="14" fill="#0b0b0b" text-anchor="middle" font-weight="700">Answer 2</text>
  <text x="250.0" y="122.0" font-size="12.5" fill="#eb6834" text-anchor="middle" font-weight="700">wrong rows</text>
  <line x1="212.0" y1="300.0" x2="256.0" y2="300.0" stroke="#2a78d6" stroke-width="3"/>
  <line x1="276.0" y1="240.0" x2="276.0" y2="286.0" stroke="#eb6834" stroke-width="3.5"/>
  <path d="M276.0,298.0 L269.4,286.0 L282.6,286.0 Z" fill="#eb6834"/>
  <text x="250.0" y="324.0" font-size="13" fill="#0b0b0b" text-anchor="middle" font-weight="600">reward 0</text>
  <text x="250.0" y="346.0" font-size="13.5" fill="#eb6834" text-anchor="middle" font-weight="700">advantage −1</text>
  <text x="250.0" y="366.0" font-size="12.5" fill="#52514e" text-anchor="middle" font-weight="400">push down</text>
  <text x="380.0" y="102.0" font-size="14" fill="#0b0b0b" text-anchor="middle" font-weight="700">Answer 3</text>
  <text x="380.0" y="122.0" font-size="12.5" fill="#eb6834" text-anchor="middle" font-weight="700">SQL error</text>
  <line x1="342.0" y1="300.0" x2="386.0" y2="300.0" stroke="#2a78d6" stroke-width="3"/>
  <line x1="406.0" y1="240.0" x2="406.0" y2="286.0" stroke="#eb6834" stroke-width="3.5"/>
  <path d="M406.0,298.0 L399.4,286.0 L412.6,286.0 Z" fill="#eb6834"/>
  <text x="380.0" y="324.0" font-size="13" fill="#0b0b0b" text-anchor="middle" font-weight="600">reward 0</text>
  <text x="380.0" y="346.0" font-size="13.5" fill="#eb6834" text-anchor="middle" font-weight="700">advantage −1</text>
  <text x="380.0" y="366.0" font-size="12.5" fill="#52514e" text-anchor="middle" font-weight="400">push down</text>
  <text x="510.0" y="102.0" font-size="14" fill="#0b0b0b" text-anchor="middle" font-weight="700">Answer 4</text>
  <text x="510.0" y="122.0" font-size="12.5" fill="#1baf7a" text-anchor="middle" font-weight="700">correct</text>
  <rect x="472.0" y="180.0" width="44.0" height="120.0" rx="3" fill="#EFF4FB" stroke="#2a78d6" stroke-width="1.5"/>
  <line x1="536.0" y1="240.0" x2="536.0" y2="194.0" stroke="#1baf7a" stroke-width="3.5"/>
  <path d="M536.0,182.0 L542.6,194.0 L529.4,194.0 Z" fill="#1baf7a"/>
  <text x="510.0" y="324.0" font-size="13" fill="#0b0b0b" text-anchor="middle" font-weight="600">reward 1</text>
  <text x="510.0" y="346.0" font-size="13.5" fill="#1baf7a" text-anchor="middle" font-weight="700">advantage +1</text>
  <text x="510.0" y="366.0" font-size="12.5" fill="#52514e" text-anchor="middle" font-weight="400">push up</text>
  <text x="730.0" y="150.0" font-size="13.5" fill="#0b0b0b" text-anchor="start" font-weight="600">mean = (1+0+0+1) / 4 = 0.5</text>
  <text x="730.0" y="174.0" font-size="13.5" fill="#0b0b0b" text-anchor="start" font-weight="600">spread (std) = 0.5</text>
  <text x="730.0" y="198.0" font-size="13.5" fill="#0b0b0b" text-anchor="start" font-weight="600">advantage = (reward − mean) / std</text>
  <text x="730.0" y="222.0" font-size="13" fill="#0b0b0b" text-anchor="start" font-weight="400"></text>
  <text x="730.0" y="246.0" font-size="13.5" fill="#52514e" text-anchor="start" font-weight="400">If all 4 rewards are equal,</text>
  <text x="730.0" y="270.0" font-size="13.5" fill="#52514e" text-anchor="start" font-weight="400">every advantage is 0 and</text>
  <text x="730.0" y="294.0" font-size="13.5" fill="#52514e" text-anchor="start" font-weight="400">this question teaches nothing.</text>
</svg></div>
<p>The <strong>advantage</strong> says how much better than its siblings an answer did. Answers with a positive advantage get <em>every token</em> made a bit more likely; answers with a negative one, a bit less likely. It is the same "nudge the numbers" step as SFT, but SFT pushes toward the answer key, while GRPO pushes toward the model's <em>own</em> better attempts and away from its worse ones.</p>
<pre><code class='language-python'>import statistics

def group_advantages(rewards, eps=1e-4):
    mean = statistics.mean(rewards)
    std = statistics.pstdev(rewards)
    return [(r - mean) / (std + eps) for r in rewards]

print(group_advantages([1, 0, 0, 1]))   # about [+1, -1, -1, +1]
print(group_advantages([0, 0, 0, 0]))   # [0, 0, 0, 0]: nothing to learn
print(group_advantages([1, 1, 1, 1]))   # [0, 0, 0, 0]: nothing to learn either</code></pre>
<p>Those last two lines matter. If every answer is wrong, or every answer is right, all advantages are zero and the question teaches nothing. GRPO learns only from questions the model <em>sometimes</em> gets right. A model that never succeeds gets no signal at all.</p>
<h4>Why "group relative"</h4>
<p>Older RL methods like PPO train a second network, a "critic", to predict how good an answer will be. GRPO skips it: the group's average <em>is</em> that prediction. No extra network means less memory, which matters on a 16 GB GPU.</p>
<p>Two more details. <strong>Clipping:</strong> each update is capped, so one lucky batch cannot move a token's probability too far. <strong>KL penalty:</strong> many setups add a cost for drifting away from the original model, but the TinyLoRA paper uses none, and neither do I.</p>
<p>I use the <code>GRPOTrainer</code> from Hugging Face's TRL library (<a href='https://huggingface.co/docs/trl/grpo_trainer' target='_blank' rel='noopener noreferrer'>docs</a>), which handles sampling, grouping and the update. The key settings are below; <a href='#/blog/finetuning_series_2_how'>part 2</a> has the full setup:</p>
<pre><code class='language-python'>from trl import GRPOConfig

args = GRPOConfig(
    num_generations=8,          # 8 sampled answers per question
    temperature=1.0,            # randomness while sampling
    max_completion_length=384,  # longest answer in tokens
    beta=0.0,                   # no KL penalty, like the paper
)</code></pre>
<h4>Why RL might suit 13 parameters</h4>
<p>SFT says: "produce exactly these tokens, in this order". That is a lot of detail, and 13 numbers cannot hold much.</p>
<p>RL says: "of the answers you can already write, prefer the ones that work". The model already has the skill and only needs a small push toward its own better habits, which 13 numbers might manage. That is the paper's claim, and what I most wanted to check. <a href='#/blog/finetuning_series_3_results'>Part 3</a> has the answer.</p>

<h3>6. Bonus: edit the weights by hand, no training at all</h3>
<h4>The idea</h4>
<p>All five methods above share one engine: compute gradients, take small steps, repeat. In November 2026 <a href='https://rikiyat.github.io/blog/weight-space-programming/' target='_blank' rel='noopener noreferrer'>MIT CSAIL tried something different</a>. They gave a strong LLM the raw weights, a sandbox to analyse them, and a small budget for running the model, and let it <em>reason</em> its way to an edit. No gradients, no optimizer. It is closer to surgery than to teaching.</p>
<p>The usual edit is a rank-one patch: the same shape as a rank-1 LoRA patch from section 2, but designed by hand instead of learned:</p>
<pre><code class='language-text'>W' = W + u × kᵀ

k: "where"  picks the inner signal that should trigger the change
u: "what"   the direction the layer's output should move when it does</code></pre>
<p>A toy. Say one neuron in a layer fires only at the moment the model starts its answer. Let k pick out that neuron, and choose u to push the output away from the word "Let" while leaving every other word alone. Now the model behaves differently at exactly that one moment, in exactly that one direction. The rest of W is untouched.</p>
<h4>How the editor works</h4>
<ul>
<li>Run the model on practice questions and read the failures.</li>
<li>Record the model's inner numbers (activations) to find where the bad behaviour is decided.</li>
<li>Design a small edit with plain linear algebra.</li>
<li>Test it side by side against the original. Keep it or undo it.</li>
</ul>
<h4>The code</h4>
<pre><code class='language-python'>W = load("model.layers.27.mlp.down_proj.weight")   # one weight matrix, on CPU
W[:, S] += torch.outer(u, k[S])                     # rank-one patch on a few columns S
save_edit("model.layers.27.mlp.down_proj.weight", W)</code></pre>
<h4>What it changes</h4>
<p>A few thousand to a few hundred thousand weights in one or two matrices. There is nothing to train, so no gradients and no optimizer memory. The cost moves elsewhere: the editor's reasoning time, and a budget of model runs to test each idea. I ran it with Claude Opus 5.5 as the editor; <a href='#/blog/finetuning_series_3_results'>part 3</a> shows what it found.</p>
<p>The catch: it can only fix what it can find. A habit with a clear trigger is a good target. Knowledge spread across the whole model is not.</p>

<h3>All six side by side</h3>
<p>Trainable counts are for Qwen2.5-Coder-1.5B with the settings above.</p>
<div style="overflow-x:auto;margin:1.9rem 0"><table><thead><tr><th>Method</th><th>What trains</th><th class='num'>Trainable numbers</th><th>Use when</th></tr></thead><tbody>
<tr><td>Full fine-tuning</td><td>every weight</td><td class='num'>1,543,714,304 (100%)</td><td>plenty of memory, big changes</td></tr>
<tr><td>LoRA</td><td>thin patches B and A</td><td class='num'>73,859,072 (4.8%)</td><td>almost always: the default</td></tr>
<tr><td>LoRA-FA</td><td>B only</td><td class='num'>41,287,680 (2.7%)</td><td>memory is tight, plain LoRA code</td></tr>
<tr><td>QLoRA</td><td>B and A, on a 4-bit W</td><td class='num'>73,859,072 (4.8%)</td><td>the model does not fit in 16-bit (say 7B on 16 GB)</td></tr>
<tr><td>TinyLoRA</td><td>one shared vector v</td><td class='num'>13</td><td>tiny behavior changes, with RL</td></tr>
<tr><td>Hand edit (bonus)</td><td>a few columns, chosen by an LLM</td><td class='num'>48,398 changed in my run</td><td>removing one specific habit you can see</td></tr>
</tbody></table></div>

<h3>Glossary</h3>
<ul><li><strong>Rank-one edit</strong>: a change to a matrix that is one column times one row (u &times; k&#7488;); the shape of the bonus hand edits.</li>
<li><strong>Weight / parameter</strong>: one number inside the model.</li>
<li><strong>Matrix</strong>: a grid of numbers.</li>
<li><strong>Identity matrix</strong>: the do-nothing grid (1s on the diagonal, 0s elsewhere).</li>
<li><strong>Token</strong>: a word or piece of a word.</li>
<li><strong>Attention / MLP</strong>: tokens looking at each other / each token processed alone.</li>
<li><strong>Loss</strong>: how wrong the model was, as one number.</li>
<li><strong>Gradient</strong>: which way, and how hard, to move each weight.</li>
<li><strong>Learning rate</strong>: the step size.</li>
<li><strong>Adam</strong>: the usual optimizer; two running averages per weight.</li>
<li><strong>Activations</strong>: each layer's intermediate results, kept for the backward pass.</li>
<li><strong>bf16</strong>: a 16-bit number format, 2 to 3 significant digits.</li>
<li><strong>Gradient checkpointing</strong>: recompute activations instead of keeping them.</li>
<li><strong>LoRA</strong>: a thin trained patch B&times;A added to a frozen W.</li>
<li><strong>Rank</strong>: how thick a LoRA patch is.</li>
<li><strong>Adapter</strong>: trained extra numbers on top of a frozen model.</li>
<li><strong>Quantization</strong>: rounding numbers to a few levels to store fewer bits.</li>
<li><strong>NF4</strong>: a 4-bit format with its 16 levels packed near zero.</li>
<li><strong>SVD</strong>: splits a matrix into directions and strengths.</li>
<li><strong>SFT</strong>: training on known correct answers.</li>
<li><strong>RL</strong>: try, get graded, do more of what scored well.</li>
<li><strong>Reward</strong>: the grader's score; here 1 for the right rows, else 0.</li>
<li><strong>GRPO</strong>: sample several answers, favor those above the group average.</li>
<li><strong>Advantage</strong>: (reward - mean) / spread within the group.</li>
<li><strong>KL penalty</strong>: a cost for drifting from the original model; not used here.</li>
</ul>

<p><strong>Next:</strong> <a href='#/blog/finetuning_series_2_how'>Part 2: How I tested them: teaching AI to write SQL</a>. It covers the task, the grader, running model-written SQL safely, and the exact training setup for all five methods.</p>

`,
};

export default post;
