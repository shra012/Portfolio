const post = {
  id: "finetuning_series_3_results",
  title: "The results: what 13 parameters and 74 million parameters got me",
  date: "November 07, 2026",
  part: 3,
  aiSummary: "Part 3 of 3: the results of fine-tuning Qwen2.5-Coder-1.5B five ways on the BIRD text-to-SQL benchmark. LoRA and QLoRA lifted execution accuracy from 28.49% to about 42% (a gain McNemar's test says is not luck), full fine-tuning reached 36.11% with 92% of its 16-bit weights never changing, and TinyLoRA's 13 numbers mostly changed the answer format, scoring 30.44% with both SFT and GRPO. A bonus sixth method lets Claude Opus 5.5 edit 48,398 weights directly with no training: it removes the model's habit of explaining before answering and lands at 30.12%. Includes a coin-flip explanation of the significance test, real before/after SQL, costs, and honest caveats.",
  image: "blog/text2sql-peft/hero_part3.png",
  tags: ["AI", "LLM", "Fine-tuning", "LoRA", "QLoRA", "TinyLoRA", "Text-to-SQL", "Reinforcement Learning", "GRPO", "Statistics"],
  type: 'Article',
  content: `
<p><em>This is part 3 of 3. <a href='#/blog/finetuning_series_1_methods'>Part 1</a> explains the five fine-tuning methods. <a href='#/blog/finetuning_series_2_how'>Part 2</a> explains how I tested them. This part is the results.</em></p>
<p><em>About 23 min read.</em></p>
<blockquote><p><strong>In short</strong></p><ul><li>LoRA and QLoRA added about 14 points (28.49% to 42%), and a significance test says that is real, not luck.</li><li>Full fine-tuning added only 7.6 points, likely held back by 16-bit rounding: 92% of its weights never changed.</li><li>TinyLoRA added 2 points with SFT and GRPO alike, which could be luck; what its 13 numbers learned was the answer format.</li><li>Bonus: Claude Opus 5.5 edited 48,398 weights directly, with no training at all. It removed the "let me explain first" habit completely and landed at +1.6 points, right next to TinyLoRA.</li></ul></blockquote>
<p>Quick recap: I fine-tuned <code>Qwen2.5-Coder-1.5B-Instruct</code> (1.54 billion parameters) with the five methods from <a href='#/blog/finetuning_series_1_methods'>part 1</a>, training TinyLoRA twice: once with supervised fine-tuning (SFT) and once with reinforcement learning (GRPO). Each model then answered the same 1,534 BIRD dev questions, and an answer counts as correct when its SQL returns the same rows as the reference ("gold") SQL. That score is <strong>execution accuracy</strong> (EX); <a href='#/blog/finetuning_series_2_how'>part 2</a> has the setup. At the end there is a bonus sixth method: letting an LLM edit the weights directly.</p>
<h3>The scoreboard</h3>
<p>Every run, plus the untouched base model and one extra row: the QLoRA patch served on top of the 4-bit model, the way you'd deploy it if memory is tight. "Correct" is the raw count out of 1,534, so you can check any score by hand: LoRA's 645 / 1,534 = 0.4205, or 42.05%.</p>
<div style="overflow-x:auto;margin:1.9rem 0"><table><thead><tr><th>Method</th><th class='num'>Trainable params</th><th class='num'>Correct</th><th class='num'>EX</th><th class='num'>Simple</th><th class='num'>Moderate</th><th class='num'>Challenging</th><th class='num'>Change vs base</th></tr></thead><tbody>
<tr><td>Base model (no training)</td><td class='num'>0</td><td class='num'>437</td><td class='num'>28.49</td><td class='num'>35.78</td><td class='num'>17.89</td><td class='num'>15.86</td><td class='num'>&ndash;</td></tr>
<tr><td>Full fine-tuning</td><td class='num'>1.54B</td><td class='num'>554</td><td class='num'>36.11</td><td class='num'>42.38</td><td class='num'>28.88</td><td class='num'>19.31</td><td class='num'>+7.62</td></tr>
<tr><td>LoRA (r=64)</td><td class='num'>73.9M</td><td class='num'>645</td><td class='num'>42.05</td><td class='num'>49.62</td><td class='num'>32.33</td><td class='num'>24.83</td><td class='num'>+13.56</td></tr>
<tr><td>LoRA-FA</td><td class='num'>41.3M</td><td class='num'>622</td><td class='num'>40.55</td><td class='num'>48.43</td><td class='num'>30.39</td><td class='num'>22.76</td><td class='num'>+12.06</td></tr>
<tr><td>QLoRA (NF4)</td><td class='num'>73.9M</td><td class='num'>651</td><td class='num'><strong>42.44</strong></td><td class='num'>49.41</td><td class='num'>32.97</td><td class='num'>28.28</td><td class='num'>+13.95</td></tr>
<tr><td>QLoRA, served in 4-bit</td><td class='num'>73.9M</td><td class='num'>636</td><td class='num'>41.46</td><td class='num'>48.54</td><td class='num'>32.11</td><td class='num'>26.21</td><td class='num'>+12.97</td></tr>
<tr><td>TinyLoRA, SFT</td><td class='num'>13</td><td class='num'>467</td><td class='num'>30.44</td><td class='num'>36.97</td><td class='num'>21.12</td><td class='num'>18.62</td><td class='num'>+1.95</td></tr>
<tr><td>TinyLoRA, GRPO</td><td class='num'>13</td><td class='num'>467</td><td class='num'>30.44</td><td class='num'>37.51</td><td class='num'>20.26</td><td class='num'>17.93</td><td class='num'>+1.95</td></tr>
<tr><td>Opus weight edit (bonus, below)</td><td class='num'>48,398 changed</td><td class='num'>462</td><td class='num'>30.12</td><td class='num'>37.41</td><td class='num'>19.83</td><td class='num'>16.55</td><td class='num'>+1.63</td></tr>
</tbody></table></div>
<p>All numbers are percentages except the first two columns. "Change vs base" is in percentage points: 42.05 &minus; 28.49 = +13.56.</p>
<div style="overflow-x:auto;margin:1.9rem 0"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 470" style="width:100%;min-width:660px;height:auto;display:block" font-family="ui-sans-serif,system-ui,Helvetica,Arial,sans-serif" role="img" aria-label="Accuracy vs. how many numbers you train">
  <rect width="1000" height="470" rx="14" fill="#FCFCFB" stroke="#E2E8F0" stroke-width="2"/>
  <text x="28" y="40" font-size="19" font-weight="700" fill="#0b0b0b">Accuracy vs. how many numbers you train</text>
  <text x="28" y="64" font-size="14" fill="#52514e">BIRD dev execution accuracy, 1,534 questions. Hover a point for exact values.</text>
  <line x1="80" y1="400.0" x2="960" y2="400.0" stroke="#E8ECF2"/>
  <text x="70.0" y="404.0" font-size="12" fill="#52514e" text-anchor="end" font-weight="400">26%</text>
  <line x1="80" y1="366.7" x2="960" y2="366.7" stroke="#E8ECF2"/>
  <text x="70.0" y="370.7" font-size="12" fill="#52514e" text-anchor="end" font-weight="400">28%</text>
  <line x1="80" y1="333.3" x2="960" y2="333.3" stroke="#E8ECF2"/>
  <text x="70.0" y="337.3" font-size="12" fill="#52514e" text-anchor="end" font-weight="400">30%</text>
  <line x1="80" y1="300.0" x2="960" y2="300.0" stroke="#E8ECF2"/>
  <text x="70.0" y="304.0" font-size="12" fill="#52514e" text-anchor="end" font-weight="400">32%</text>
  <line x1="80" y1="266.7" x2="960" y2="266.7" stroke="#E8ECF2"/>
  <text x="70.0" y="270.7" font-size="12" fill="#52514e" text-anchor="end" font-weight="400">34%</text>
  <line x1="80" y1="233.3" x2="960" y2="233.3" stroke="#E8ECF2"/>
  <text x="70.0" y="237.3" font-size="12" fill="#52514e" text-anchor="end" font-weight="400">36%</text>
  <line x1="80" y1="200.0" x2="960" y2="200.0" stroke="#E8ECF2"/>
  <text x="70.0" y="204.0" font-size="12" fill="#52514e" text-anchor="end" font-weight="400">38%</text>
  <line x1="80" y1="166.7" x2="960" y2="166.7" stroke="#E8ECF2"/>
  <text x="70.0" y="170.7" font-size="12" fill="#52514e" text-anchor="end" font-weight="400">40%</text>
  <line x1="80" y1="133.3" x2="960" y2="133.3" stroke="#E8ECF2"/>
  <text x="70.0" y="137.3" font-size="12" fill="#52514e" text-anchor="end" font-weight="400">42%</text>
  <line x1="80" y1="100.0" x2="960" y2="100.0" stroke="#E8ECF2"/>
  <text x="70.0" y="104.0" font-size="12" fill="#52514e" text-anchor="end" font-weight="400">44%</text>
  <text x="126.3" y="422" font-size="12" fill="#52514e" text-anchor="middle">10</text>
  <text x="218.9" y="422" font-size="12" fill="#52514e" text-anchor="middle">100</text>
  <text x="311.6" y="422" font-size="12" fill="#52514e" text-anchor="middle">1000</text>
  <text x="404.2" y="422" font-size="12" fill="#52514e" text-anchor="middle">10<tspan dy="-6" font-size="9">4</tspan></text>
  <text x="496.8" y="422" font-size="12" fill="#52514e" text-anchor="middle">10<tspan dy="-6" font-size="9">5</tspan></text>
  <text x="589.5" y="422" font-size="12" fill="#52514e" text-anchor="middle">10<tspan dy="-6" font-size="9">6</tspan></text>
  <text x="682.1" y="422" font-size="12" fill="#52514e" text-anchor="middle">10<tspan dy="-6" font-size="9">7</tspan></text>
  <text x="774.7" y="422" font-size="12" fill="#52514e" text-anchor="middle">10<tspan dy="-6" font-size="9">8</tspan></text>
  <text x="867.4" y="422" font-size="12" fill="#52514e" text-anchor="middle">10<tspan dy="-6" font-size="9">9</tspan></text>
  <text x="520.0" y="448.0" font-size="13" fill="#52514e" text-anchor="middle" font-weight="400">Trainable numbers, or weights changed for the Opus edit (log scale)</text>
  <line x1="80" y1="358.5" x2="960" y2="358.5" stroke="#94a3b8" stroke-width="2" stroke-dasharray="6 5"/>
  <text x="88.0" y="350.5" font-size="13" fill="#52514e" text-anchor="start" font-weight="400">Base model, no training: 28.49%</text>
  <circle cx="884.8" cy="231.5" r="8" fill="#2a78d6" stroke="#FCFCFB" stroke-width="2"><title>Full fine-tune: 36.11% with 1,543,714,304 trainable parameters</title></circle>
  <text x="872.8" y="217.5" font-size="13" fill="#0b0b0b" text-anchor="end" font-weight="600">Full fine-tune 36.11%</text>
  <circle cx="762.5" cy="132.5" r="8" fill="#2a78d6" stroke="#FCFCFB" stroke-width="2"><title>LoRA: 42.05% with 73,859,072 trainable parameters</title></circle>
  <text x="776.5" y="150.5" font-size="13" fill="#0b0b0b" text-anchor="start" font-weight="600">LoRA 42.05%</text>
  <circle cx="739.1" cy="157.5" r="8" fill="#2a78d6" stroke="#FCFCFB" stroke-width="2"><title>LoRA-FA: 40.55% with 41,287,680 trainable parameters</title></circle>
  <text x="725.1" y="162.5" font-size="13" fill="#0b0b0b" text-anchor="end" font-weight="600">LoRA-FA 40.55%</text>
  <circle cx="762.5" cy="126.0" r="8" fill="#2a78d6" stroke="#FCFCFB" stroke-width="2"><title>QLoRA: 42.44% with 73,859,072 trainable parameters</title></circle>
  <text x="776.5" y="118.0" font-size="13" fill="#0b0b0b" text-anchor="start" font-weight="600">QLoRA 42.44%</text>
  <circle cx="136.9" cy="326.0" r="8" fill="#2a78d6" stroke="#FCFCFB" stroke-width="2"><title>TinyLoRA + SFT: 30.44% with 13 trainable parameters</title></circle>
  <circle cx="136.9" cy="326.0" r="8" fill="#2a78d6" stroke="#FCFCFB" stroke-width="2"><title>TinyLoRA + GRPO: 30.44% with 13 trainable parameters</title></circle>
  <circle cx="467.6" cy="331.3" r="8" fill="#2a78d6" stroke="#FCFCFB" stroke-width="2"><title>Opus weight edit: 30.12% with 48,398 trainable parameters</title></circle>
  <text x="481.6" y="319.3" font-size="13" fill="#0b0b0b" text-anchor="start" font-weight="600">Opus weight edit 30.12% (48,398 weights changed)</text>
  <text x="150.9" y="316.0" font-size="13" fill="#0b0b0b" text-anchor="start" font-weight="600">TinyLoRA, SFT and GRPO: 30.44% (both runs)</text>
  <text x="150.9" y="334.0" font-size="12" fill="#52514e" text-anchor="start" font-weight="400">13 trainable numbers</text>
</svg></div>
<p>In plain words:</p>
<ul>
<li><strong>Every method beat the base model.</strong> Even 13 numbers moved the score a little.</li>
<li><strong>The LoRA family won.</strong> LoRA, LoRA-FA and QLoRA landed between 40.55% and 42.44%: 12 to 14 points above the base model, or roughly 185 to 214 more correct answers.</li>
<li><strong>More trainable numbers did not mean a better score.</strong> Full fine-tuning changed all 1.54 billion weights and scored 36.11%, six points below LoRA. I have a guess why, further down.</li>
<li><strong>TinyLoRA barely moved.</strong> Both runs got 467 questions right, against 437 for the base model. The bonus weight edit by Opus landed next to them, at 462.</li>
</ul>
<p>The x-axis in the picture is a log scale: each tick is ten times the one before. If more trainable numbers always helped, the dots would climb steadily to the right. Instead they climb, flatten, and drop at the far right.</p>
<h3>Is it real or luck?</h3>
<p>A score can go up by luck. So before believing any of this, I want to know: could a gain this size happen by chance?</p>
<h4>Count what changed, not the totals</h4>
<p>Most questions don't change at all: both models get them right, or both get them wrong. Those tell us nothing about which model is better. What matters are the questions where the two models <em>disagree</em>. There are two kinds:</p>
<ul>
<li><strong>Fixed</strong>: the base model was wrong, the tuned model is right.</li>
<li><strong>Broke</strong>: the base model was right, the tuned model is wrong.</li>
</ul>
<p>LoRA fixed 299 questions and broke 91. Check: 437 + 299 &minus; 91 = 645, which is exactly LoRA's count of correct answers.</p>
<h4>The coin-flip story</h4>
<p>Imagine fine-tuning did nothing useful and just shuffled the model's mistakes around. Then every question where the two models disagree is like a coin flip: heads it lands in "fixed", tails in "broke". Over many flips you would expect roughly half and half.</p>
<p>So the question becomes: if I flip a fair coin 390 times (299 + 91), how likely is a split as lopsided as 299 to 91, or worse? That probability is the <strong>p-value</strong>. A small p means "a fair coin would almost never do this", so the change is probably real. A common rule of thumb: under 0.05 (1 in 20) counts as real. This test is called <strong><a href='https://en.wikipedia.org/wiki/McNemar%27s_test' target='_blank' rel='noopener noreferrer'>McNemar's test</a></strong>.</p>
<p>A tiny example you can do by hand. Say a method fixed 9 questions and broke 1: 10 coin flips. There is 1 way to get zero tails and 10 ways to get exactly one tail, so 11 of the 2<sup>10</sup> = 1,024 possible outcomes are this lopsided. It could also go the other way round (1 fixed, 9 broke), so double it: 2 &times; 11 / 1,024 = 0.021. About a 2% chance. Probably real.</p>
<p>Here is the same thing in Python. It is the exact calculation I used for every row below:</p>
<pre><code class='language-python'>from math import comb

def mcnemar_p(fixed, broke):
    n = fixed + broke          # questions where the two models disagree
    k = min(fixed, broke)      # the smaller side
    # chance a fair coin gives a split at least this lopsided, either way round
    p = 2 * sum(comb(n, i) for i in range(k + 1)) / 2**n
    return min(p, 1.0)

print(mcnemar_p(9, 1))       # 0.021484375
print(mcnemar_p(299, 91))    # 5.6e-27   (LoRA)
print(mcnemar_p(160, 130))   # 0.088     (TinyLoRA + GRPO)</code></pre>
<p><code>comb(n, i)</code> counts the ways to get <code>i</code> tails in <code>n</code> flips.</p>
<div style="overflow-x:auto;margin:1.9rem 0"><table><thead><tr><th>Method (vs base)</th><th class='num'>Fixed</th><th class='num'>Broke</th><th class='num'>p-value</th><th>Verdict</th></tr></thead><tbody>
<tr><td>Full fine-tuning</td><td class='num'>223</td><td class='num'>106</td><td class='num'>1.0 &times; 10<sup>-10</sup></td><td>real</td></tr>
<tr><td>LoRA</td><td class='num'>299</td><td class='num'>91</td><td class='num'>5.6 &times; 10<sup>-27</sup></td><td>real</td></tr>
<tr><td>LoRA-FA</td><td class='num'>292</td><td class='num'>107</td><td class='num'>6.2 &times; 10<sup>-21</sup></td><td>real</td></tr>
<tr><td>QLoRA</td><td class='num'>307</td><td class='num'>93</td><td class='num'>8.3 &times; 10<sup>-28</sup></td><td>real</td></tr>
<tr><td>QLoRA, served in 4-bit</td><td class='num'>296</td><td class='num'>97</td><td class='num'>1.6 &times; 10<sup>-24</sup></td><td>real</td></tr>
<tr><td>TinyLoRA, SFT</td><td class='num'>155</td><td class='num'>125</td><td class='num'>0.083</td><td>could be luck</td></tr>
<tr><td>TinyLoRA, GRPO</td><td class='num'>160</td><td class='num'>130</td><td class='num'>0.088</td><td>could be luck</td></tr>
<tr><td>Opus weight edit</td><td class='num'>97</td><td class='num'>72</td><td class='num'>0.065</td><td>could be luck</td></tr>
</tbody></table></div>
<p>The LoRA family's gains are not luck. TinyLoRA's are a different story: about an 8 to 9% chance under the coin-flip story. That doesn't prove TinyLoRA did nothing. It means this experiment can't tell its +1.95 points apart from noise.</p>
<p>Notice that every method broke something: even LoRA broke 91 questions the base model got right. The same test also works between any two models:</p>
<ul>
<li><strong>LoRA vs QLoRA:</strong> 66 questions only LoRA got right, 72 only QLoRA got right. p = 0.67. A tie.</li>
<li><strong>LoRA vs LoRA-FA:</strong> 84 vs 61. p = 0.067. LoRA is probably a bit better, but not clearly.</li>
<li><strong>LoRA vs full fine-tuning:</strong> 170 vs 79. p = 8 &times; 10<sup>-9</sup>. In this setup, the gap is real.</li>
</ul>
<h3>By difficulty</h3>
<p>BIRD labels each question simple, moderate or challenging.</p>
<div style="overflow-x:auto;margin:1.9rem 0"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 470" style="width:100%;min-width:660px;height:auto;display:block" font-family="ui-sans-serif,system-ui,Helvetica,Arial,sans-serif" role="img" aria-label="Accuracy by BIRD difficulty">
  <rect width="1000" height="470" rx="14" fill="#FCFCFB" stroke="#E2E8F0" stroke-width="2"/>
  <text x="28" y="40" font-size="19" font-weight="700" fill="#0b0b0b">Accuracy by BIRD difficulty</text>
  <text x="28" y="64" font-size="14" fill="#52514e">Only 145 challenging questions, so each one there is worth 0.7 points. Hover a bar for the value.</text>
  <line x1="70" y1="390.0" x2="970" y2="390.0" stroke="#E8ECF2"/>
  <text x="60.0" y="394.0" font-size="12" fill="#52514e" text-anchor="end" font-weight="400">0%</text>
  <line x1="70" y1="339.1" x2="970" y2="339.1" stroke="#E8ECF2"/>
  <text x="60.0" y="343.1" font-size="12" fill="#52514e" text-anchor="end" font-weight="400">10%</text>
  <line x1="70" y1="288.2" x2="970" y2="288.2" stroke="#E8ECF2"/>
  <text x="60.0" y="292.2" font-size="12" fill="#52514e" text-anchor="end" font-weight="400">20%</text>
  <line x1="70" y1="237.3" x2="970" y2="237.3" stroke="#E8ECF2"/>
  <text x="60.0" y="241.3" font-size="12" fill="#52514e" text-anchor="end" font-weight="400">30%</text>
  <line x1="70" y1="186.4" x2="970" y2="186.4" stroke="#E8ECF2"/>
  <text x="60.0" y="190.4" font-size="12" fill="#52514e" text-anchor="end" font-weight="400">40%</text>
  <line x1="70" y1="135.5" x2="970" y2="135.5" stroke="#E8ECF2"/>
  <text x="60.0" y="139.5" font-size="12" fill="#52514e" text-anchor="end" font-weight="400">50%</text>
  <rect x="28" y="84" width="14" height="14" rx="3" fill="#2a78d6"/>
  <text x="48.0" y="96.0" font-size="13" fill="#0b0b0b" text-anchor="start" font-weight="400">Simple (925 Qs)</text>
  <rect x="198" y="84" width="14" height="14" rx="3" fill="#eb6834"/>
  <text x="218.0" y="96.0" font-size="13" fill="#0b0b0b" text-anchor="start" font-weight="400">Moderate (464)</text>
  <rect x="368" y="84" width="14" height="14" rx="3" fill="#1baf7a"/>
  <text x="388.0" y="96.0" font-size="13" fill="#0b0b0b" text-anchor="start" font-weight="400">Challenging (145)</text>
  <path d="M85.2,390 V211.8 Q85.2,207.8 89.2,207.8 H107.2 Q111.2,207.8 111.2,211.8 V390 Z" fill="#2a78d6"><title>Base model, simple: 35.78%</title></path>
  <path d="M113.2,390 V302.9 Q113.2,298.9 117.2,298.9 H135.2 Q139.2,298.9 139.2,302.9 V390 Z" fill="#eb6834"><title>Base model, moderate: 17.89%</title></path>
  <path d="M141.2,390 V313.3 Q141.2,309.3 145.2,309.3 H163.2 Q167.2,309.3 167.2,313.3 V390 Z" fill="#1baf7a"><title>Base model, challenging: 15.86%</title></path>
  <text x="126.2" y="412.0" font-size="12.5" fill="#0b0b0b" text-anchor="middle" font-weight="600">Base model</text>
  <path d="M197.8,390 V178.2 Q197.8,174.2 201.8,174.2 H219.8 Q223.8,174.2 223.8,178.2 V390 Z" fill="#2a78d6"><title>Full fine-tune, simple: 42.38%</title></path>
  <path d="M225.8,390 V247.0 Q225.8,243.0 229.8,243.0 H247.8 Q251.8,243.0 251.8,247.0 V390 Z" fill="#eb6834"><title>Full fine-tune, moderate: 28.88%</title></path>
  <path d="M253.8,390 V295.7 Q253.8,291.7 257.8,291.7 H275.8 Q279.8,291.7 279.8,295.7 V390 Z" fill="#1baf7a"><title>Full fine-tune, challenging: 19.31%</title></path>
  <text x="238.8" y="412.0" font-size="12.5" fill="#0b0b0b" text-anchor="middle" font-weight="600">Full</text>
  <text x="238.8" y="428.0" font-size="12.5" fill="#0b0b0b" text-anchor="middle" font-weight="600">fine-tune</text>
  <path d="M310.2,390 V141.4 Q310.2,137.4 314.2,137.4 H332.2 Q336.2,137.4 336.2,141.4 V390 Z" fill="#2a78d6"><title>LoRA, simple: 49.62%</title></path>
  <path d="M338.2,390 V229.4 Q338.2,225.4 342.2,225.4 H360.2 Q364.2,225.4 364.2,229.4 V390 Z" fill="#eb6834"><title>LoRA, moderate: 32.33%</title></path>
  <path d="M366.2,390 V267.6 Q366.2,263.6 370.2,263.6 H388.2 Q392.2,263.6 392.2,267.6 V390 Z" fill="#1baf7a"><title>LoRA, challenging: 24.83%</title></path>
  <text x="351.2" y="412.0" font-size="12.5" fill="#0b0b0b" text-anchor="middle" font-weight="600">LoRA</text>
  <path d="M422.8,390 V147.4 Q422.8,143.4 426.8,143.4 H444.8 Q448.8,143.4 448.8,147.4 V390 Z" fill="#2a78d6"><title>LoRA-FA, simple: 48.43%</title></path>
  <path d="M450.8,390 V239.3 Q450.8,235.3 454.8,235.3 H472.8 Q476.8,235.3 476.8,239.3 V390 Z" fill="#eb6834"><title>LoRA-FA, moderate: 30.39%</title></path>
  <path d="M478.8,390 V278.1 Q478.8,274.1 482.8,274.1 H500.8 Q504.8,274.1 504.8,278.1 V390 Z" fill="#1baf7a"><title>LoRA-FA, challenging: 22.76%</title></path>
  <text x="463.8" y="412.0" font-size="12.5" fill="#0b0b0b" text-anchor="middle" font-weight="600">LoRA-FA</text>
  <path d="M535.2,390 V142.5 Q535.2,138.5 539.2,138.5 H557.2 Q561.2,138.5 561.2,142.5 V390 Z" fill="#2a78d6"><title>QLoRA, simple: 49.41%</title></path>
  <path d="M563.2,390 V226.2 Q563.2,222.2 567.2,222.2 H585.2 Q589.2,222.2 589.2,226.2 V390 Z" fill="#eb6834"><title>QLoRA, moderate: 32.97%</title></path>
  <path d="M591.2,390 V250.0 Q591.2,246.0 595.2,246.0 H613.2 Q617.2,246.0 617.2,250.0 V390 Z" fill="#1baf7a"><title>QLoRA, challenging: 28.28%</title></path>
  <text x="576.2" y="412.0" font-size="12.5" fill="#0b0b0b" text-anchor="middle" font-weight="600">QLoRA</text>
  <path d="M647.8,390 V205.8 Q647.8,201.8 651.8,201.8 H669.8 Q673.8,201.8 673.8,205.8 V390 Z" fill="#2a78d6"><title>TinyLoRA + SFT, simple: 36.97%</title></path>
  <path d="M675.8,390 V286.5 Q675.8,282.5 679.8,282.5 H697.8 Q701.8,282.5 701.8,286.5 V390 Z" fill="#eb6834"><title>TinyLoRA + SFT, moderate: 21.12%</title></path>
  <path d="M703.8,390 V299.2 Q703.8,295.2 707.8,295.2 H725.8 Q729.8,295.2 729.8,299.2 V390 Z" fill="#1baf7a"><title>TinyLoRA + SFT, challenging: 18.62%</title></path>
  <text x="688.8" y="412.0" font-size="12.5" fill="#0b0b0b" text-anchor="middle" font-weight="600">TinyLoRA</text>
  <text x="688.8" y="428.0" font-size="12.5" fill="#0b0b0b" text-anchor="middle" font-weight="600">+ SFT</text>
  <path d="M760.2,390 V203.0 Q760.2,199.0 764.2,199.0 H782.2 Q786.2,199.0 786.2,203.0 V390 Z" fill="#2a78d6"><title>TinyLoRA + GRPO, simple: 37.51%</title></path>
  <path d="M788.2,390 V290.9 Q788.2,286.9 792.2,286.9 H810.2 Q814.2,286.9 814.2,290.9 V390 Z" fill="#eb6834"><title>TinyLoRA + GRPO, moderate: 20.26%</title></path>
  <path d="M816.2,390 V302.7 Q816.2,298.7 820.2,298.7 H838.2 Q842.2,298.7 842.2,302.7 V390 Z" fill="#1baf7a"><title>TinyLoRA + GRPO, challenging: 17.93%</title></path>
  <text x="801.2" y="412.0" font-size="12.5" fill="#0b0b0b" text-anchor="middle" font-weight="600">TinyLoRA</text>
  <text x="801.2" y="428.0" font-size="12.5" fill="#0b0b0b" text-anchor="middle" font-weight="600">+ GRPO</text>
  <path d="M872.8,390 V203.5 Q872.8,199.5 876.8,199.5 H894.8 Q898.8,199.5 898.8,203.5 V390 Z" fill="#2a78d6"><title>Opus weight edit, simple: 37.41%</title></path>
  <path d="M900.8,390 V293.0 Q900.8,289.0 904.8,289.0 H922.8 Q926.8,289.0 926.8,293.0 V390 Z" fill="#eb6834"><title>Opus weight edit, moderate: 19.83%</title></path>
  <path d="M928.8,390 V309.7 Q928.8,305.7 932.8,305.7 H950.8 Q954.8,305.7 954.8,309.7 V390 Z" fill="#1baf7a"><title>Opus weight edit, challenging: 16.55%</title></path>
  <text x="913.8" y="412.0" font-size="12.5" fill="#0b0b0b" text-anchor="middle" font-weight="600">Opus weight</text>
  <text x="913.8" y="428.0" font-size="12.5" fill="#0b0b0b" text-anchor="middle" font-weight="600">edit</text>
  <line x1="70" y1="390" x2="970" y2="390" stroke="#94a3b8"/>
</svg></div>
<ul>
<li><strong>The gains are not only on easy questions.</strong> LoRA lifts simple questions from 35.78% to 49.62%, and moderate ones from 17.89% to 32.33%. On moderate questions that is 83 correct answers going to 150, nearly double.</li>
<li><strong>Be careful with the challenging bars.</strong> There are only 145 challenging questions, so each one is worth 100 / 145 = 0.7 points. QLoRA's best-in-show 28.28% is 41 questions; LoRA's 24.83% is 36. That 3.45-point gap is five questions.</li>
<li><strong>TinyLoRA is close to the base model everywhere.</strong> On challenging questions it got 27 (SFT) and 26 (GRPO) right, against 23 for the base model. Three or four questions.</li>
<li><strong>Full fine-tuning trails the LoRA family at every level.</strong></li>
</ul>
<h3>What the base model got wrong, and what fine-tuning fixed</h3>
<p>The most useful thing I did was look at <em>how</em> the base model fails. 693 of its 1,534 queries don't even run. And 602 of those 693 fail with the same SQLite error: <code>no such column</code>. The model writes valid SQL. It just names columns that aren't there, often a column that does exist, but in a different table.</p>
<p>That is the error fine-tuning fixed most:</p>
<div style="overflow-x:auto;margin:1.9rem 0"><table><thead><tr><th>Method</th><th class='num'>Queries that error</th><th class='num'>of which "no such column"</th></tr></thead><tbody>
<tr><td>Base model</td><td class='num'>693</td><td class='num'>602</td></tr>
<tr><td>Full fine-tuning</td><td class='num'>484</td><td class='num'>444</td></tr>
<tr><td>LoRA</td><td class='num'>342</td><td class='num'>300</td></tr>
<tr><td>LoRA-FA</td><td class='num'>342</td><td class='num'>300</td></tr>
<tr><td>QLoRA</td><td class='num'>339</td><td class='num'>296</td></tr>
<tr><td>QLoRA, served in 4-bit</td><td class='num'>316</td><td class='num'>270</td></tr>
<tr><td>TinyLoRA, SFT</td><td class='num'>627</td><td class='num'>555</td></tr>
<tr><td>TinyLoRA, GRPO</td><td class='num'>603</td><td class='num'>525</td></tr>
<tr><td>Opus weight edit</td><td class='num'>653</td><td class='num'>582</td></tr>
</tbody></table></div>
<p>LoRA cut "no such column" errors in half. And of the 299 questions LoRA fixed, 190 were questions where the base model had failed with "no such column". So almost two thirds of LoRA's gain is one lesson: <em>which column lives in which table</em>.</p>
<h4>Example 1: the column is in the other table</h4>
<p>From the toxicology database (question 261):</p>
<blockquote><p>Write down bond id for molecules that are carcinogenic. (Hint from BIRD: label = '+' means molecules are carcinogenic.)</p></blockquote>
<p>Base model:</p>
<pre><code class='language-sql'>SELECT bond_id FROM bond WHERE label = '+'</code></pre>
<p>SQLite answers <code>no such column: label</code>. The <code>label</code> column lives in the <code>molecule</code> table, not in <code>bond</code>. The funny part: in its explanation, written just before this SQL, the base model says so itself: "The information about molecules and their labels is stored in the <code>molecule</code> table." Then it writes the query against <code>bond</code> anyway.</p>
<p>After LoRA:</p>
<pre><code class='language-sql'>SELECT T1.bond_id
FROM bond AS T1
INNER JOIN molecule AS T2 ON T1.molecule_id = T2.molecule_id
WHERE T2.label = '+'</code></pre>
<p>It joins <code>bond</code> to <code>molecule</code> through the shared <code>molecule_id</code> column and filters on the right table. Every fine-tuned model got this one, including both TinyLoRA runs (they used a subquery instead of a join).</p>
<h4>Example 2: full fine-tuning repeats the mistake, LoRA doesn't</h4>
<p>From the superhero database (question 755):</p>
<blockquote><p>List down at least five full name of Demi-God superheroes. (Hint: Demi-God superheroes refers to race = 'Demi-God'.)</p></blockquote>
<p>The base model and the fully fine-tuned model wrote the exact same query:</p>
<pre><code class='language-sql'>SELECT full_name FROM superhero WHERE race = 'Demi-God' LIMIT 5</code></pre>
<p>Again <code>no such column: race</code>. The <code>superhero</code> table only has a <code>race_id</code>; the names of races live in a separate <code>race</code> table. LoRA:</p>
<pre><code class='language-sql'>SELECT T1.full_name
FROM superhero AS T1
INNER JOIN race AS T2 ON T1.race_id = T2.id
WHERE T2.race = 'Demi-God' LIMIT 5</code></pre>
<p>This pattern is common: it is part of the 170 vs 79 split between LoRA and full fine-tuning above.</p>
<h4>Example 3: every model fails</h4>
<p>633 questions were missed by all eight runs. This one is simple and instructive (codebase_community database, question 663):</p>
<blockquote><p>What is the id of the youngest user? (Hint: the youngest user refers to MIN(Age).)</p></blockquote>
<p>All seven fine-tuned models wrote this (LoRA-FA just left out the <code>ASC</code>):</p>
<pre><code class='language-sql'>SELECT Id FROM users ORDER BY Age ASC LIMIT 1</code></pre>
<p>Looks right. But 32,007 of the 40,325 users have no age at all (<code>NULL</code>), and SQLite sorts <code>NULL</code> before every number. So this query returns a user with no age (Id &minus;1), not the youngest user. The gold query uses <code>WHERE Age = (SELECT MIN(Age) FROM users)</code>, which skips the <code>NULL</code>s and returns Id 805. (The base model wrote <code>SELECT MIN(Age) FROM users</code>, which returns an age, not an id.) None of the runs learned to watch out for empty values.</p>
<h3>Full fine-tuning vs LoRA: why the biggest method lost</h3>
<p>Full fine-tuning lets all 1.54 billion weights change, so you'd expect it to beat LoRA, or at least tie. It lost by six points, and the test above says that gap is real.</p>
<p>I don't think this means "full fine-tuning is worse". My best guess is that I crippled it to fit on the GPU. To keep memory down I stored its weights in <strong><a href='https://en.wikipedia.org/wiki/Bfloat16_floating-point_format' target='_blank' rel='noopener noreferrer'>bfloat16</a></strong> (a 16-bit number format) with no 32-bit "master copy". A 32-bit master copy alone would have been another 1.54 billion &times; 4 bytes = 6.2 GB.</p>
<h4>Why 16-bit weights can swallow small updates</h4>
<p>bfloat16 keeps only about 2 to 3 significant digits. Near 0.05, the closest numbers it can store are 0.050049 and then 0.050293. The gap between them is 0.000244. Anything smaller than half that gap gets rounded away.</p>
<p>Full fine-tuning used a learning rate of 0.00001, and with the Adam optimizer each step moves a weight by roughly the learning rate, often less. So a weight of 0.05 gets a nudge of about 0.00001, which is far smaller than half of 0.000244. The nudge is rounded off and the weight doesn't change. You can see it in two lines:</p>
<pre><code class='language-python'>import torch

w = torch.tensor(0.05, dtype=torch.bfloat16)
print(w.item())             # 0.050048828125  (closest bfloat16 to 0.05)
print((w + 1e-5).item())    # 0.050048828125  (the update vanished)</code></pre>
<p>With a 32-bit master copy, the tiny nudges pile up there until they are big enough to show. Without one, they are lost every step.</p>
<h4>I checked: most weights never moved</h4>
<p>To see if this really happened, I compared the fully fine-tuned weights with the original weights, number by number. After 125 steps, <strong>1,419,482,061 of the 1,543,714,304 weights (92%) are exactly the same, bit for bit</strong>. The weights that did move are almost all very small ones, where bfloat16's gaps are tiny. Among weights of size 0.0039 (2<sup>-8</sup>) or more, which is 84% of all weights, 99.99% never changed.</p>
<p>So "full" fine-tuning mostly tuned the smallest weights. LoRA didn't have this problem: its patch is stored in 32-bit, and it used a learning rate 20 times bigger (0.0002).</p>
<p>I measured that the rounding happened. I did <em>not</em> measure that the rounding is why it scored lower: I never reran it with a 32-bit master copy or more steps. So this stays my best guess, not a proven cause.</p>
<h3>QLoRA: same score, least memory</h3>
<p>QLoRA freezes the base model in 4-bit and trains the same LoRA patch on top. It scored 42.44% against LoRA's 42.05%. That is 651 vs 645 correct, six questions: the tie from the head-to-head test above.</p>
<p>The win is memory: 4.0 GB peak during training versus 5.0 GB for LoRA. The cost is time: 41.4 minutes versus 31.3, because the 4-bit weights have to be unpacked on every forward pass. On a 1.5B model 1 GB hardly matters. On a 7B or 13B model on a 16 GB card, it can decide whether you can train at all.</p>
<p>One detail for deployment: my 42.44% is the QLoRA patch merged into the original 16-bit weights. If you keep the base model in 4-bit when serving too, the score is 41.46%: 636 correct, 15 fewer. About one point, and with a head-to-head p of 0.26 even that could be noise. In my setup the 4-bit model was also slower to answer: 190 seconds for the whole dev set versus 110.</p>
<h3>The TinyLoRA twist</h3>
<p>This was the claim I most wanted to test. The <a href='https://arxiv.org/abs/2602.04118' target='_blank' rel='noopener noreferrer'>paper behind TinyLoRA</a> reports Qwen2.5-7B-Instruct reaching 91% on GSM8K (grade-school math word problems) by training just 13 numbers with reinforcement learning, and says supervised fine-tuning needs updates 100 to 1,000 times larger to get the same gains. The infographic I started from (see <a href='#/blog/finetuning_series_1_methods'>part 1</a>) put it more bluntly: TinyLoRA only works with RL.</p>
<h4>Same score, different models</h4>
<p>Both TinyLoRA runs scored exactly 30.44%, 467 correct answers each. My first thought was a bug: did I evaluate the same model twice?</p>
<p>No. The two models disagree on 252 questions: 126 that only SFT got right and 126 that only GRPO got right. They just land on the same total. The 13 numbers they learned differ too: the two sets point in almost unrelated directions.</p>
<p>So on this task I could not confirm "TinyLoRA only works with RL". Plain SFT got the same +1.95 points in under a quarter of the time (30 minutes vs 128), and neither gain is clearly more than luck.</p>
<h4>What the 13 numbers learned: format</h4>
<p>The score barely moved, but the answers look completely different. My prompt asks the model to "Return only the SQL in a \`\`\`sql code block". The base model often ignores that. It likes to explain its plan step by step first, then give the SQL. Only 838 of its 1,534 answers start straight with the SQL block. After TinyLoRA, 1,525 (SFT) and 1,433 (GRPO) do.</p>
<div style="overflow-x:auto;margin:1.9rem 0"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 356" style="width:100%;min-width:660px;height:auto;display:block" font-family="ui-sans-serif,system-ui,Helvetica,Arial,sans-serif" role="img" aria-label="What the tiny changes did: the shape of the answer">
  <rect width="1000" height="356" rx="14" fill="#FCFCFB" stroke="#E2E8F0" stroke-width="2"/>
  <text x="28" y="40" font-size="19" font-weight="700" fill="#0b0b0b">What the tiny changes did: the shape of the answer</text>
  <text x="28" y="64" font-size="14" fill="#52514e">All 1,534 BIRD dev answers. LoRA shown for comparison.</text>
  <text x="40.0" y="110.0" font-size="14" fill="#0b0b0b" text-anchor="start" font-weight="700">Answers that start straight with \`\`\`sql</text>
  <text x="180.0" y="147.0" font-size="13" fill="#0b0b0b" text-anchor="end" font-weight="400">Base model</text>
  <rect x="190" y="132" width="136.6" height="22" rx="4" fill="#E5E7EB" stroke="#94a3b8"><title>Base model: 838 of 1,534</title></rect>
  <text x="334.6" y="148.0" font-size="12.5" fill="#0b0b0b" text-anchor="start" font-weight="600">838 of 1,534</text>
  <text x="180.0" y="191.0" font-size="13" fill="#0b0b0b" text-anchor="end" font-weight="400">TinyLoRA + SFT</text>
  <rect x="190" y="176" width="248.5" height="22" rx="4" fill="#2a78d6" stroke="#2a78d6"><title>TinyLoRA + SFT: 1,525 of 1,534</title></rect>
  <text x="446.5" y="192.0" font-size="12.5" fill="#0b0b0b" text-anchor="start" font-weight="600">1,525 of 1,534</text>
  <text x="180.0" y="235.0" font-size="13" fill="#0b0b0b" text-anchor="end" font-weight="400">TinyLoRA + GRPO</text>
  <rect x="190" y="220" width="233.5" height="22" rx="4" fill="#2a78d6" stroke="#2a78d6"><title>TinyLoRA + GRPO: 1,433 of 1,534</title></rect>
  <text x="431.5" y="236.0" font-size="12.5" fill="#0b0b0b" text-anchor="start" font-weight="600">1,433 of 1,534</text>
  <text x="180.0" y="279.0" font-size="13" fill="#0b0b0b" text-anchor="end" font-weight="400">Opus weight edit</text>
  <rect x="190" y="264" width="250.0" height="22" rx="4" fill="#2a78d6" stroke="#2a78d6"><title>Opus weight edit: 1,534 of 1,534</title></rect>
  <text x="448.0" y="280.0" font-size="12.5" fill="#0b0b0b" text-anchor="start" font-weight="600">1,534 of 1,534</text>
  <text x="180.0" y="323.0" font-size="13" fill="#0b0b0b" text-anchor="end" font-weight="400">LoRA</text>
  <rect x="190" y="308" width="250.0" height="22" rx="4" fill="#2a78d6" stroke="#2a78d6"><title>LoRA: 1,534 of 1,534</title></rect>
  <text x="448.0" y="324.0" font-size="12.5" fill="#0b0b0b" text-anchor="start" font-weight="600">1,534 of 1,534</text>
  <text x="520.0" y="110.0" font-size="14" fill="#0b0b0b" text-anchor="start" font-weight="700">Average answer length (characters)</text>
  <text x="660.0" y="147.0" font-size="13" fill="#0b0b0b" text-anchor="end" font-weight="400">Base model</text>
  <rect x="670" y="132" width="232.1" height="22" rx="4" fill="#E5E7EB" stroke="#94a3b8"><title>Base model: 650</title></rect>
  <text x="910.1" y="148.0" font-size="12.5" fill="#0b0b0b" text-anchor="start" font-weight="600">650</text>
  <text x="660.0" y="191.0" font-size="13" fill="#0b0b0b" text-anchor="end" font-weight="400">TinyLoRA + SFT</text>
  <rect x="670" y="176" width="64.0" height="22" rx="4" fill="#2a78d6" stroke="#2a78d6"><title>TinyLoRA + SFT: 179</title></rect>
  <text x="742.0" y="192.0" font-size="12.5" fill="#0b0b0b" text-anchor="start" font-weight="600">179</text>
  <text x="660.0" y="235.0" font-size="13" fill="#0b0b0b" text-anchor="end" font-weight="400">TinyLoRA + GRPO</text>
  <rect x="670" y="220" width="85.4" height="22" rx="4" fill="#2a78d6" stroke="#2a78d6"><title>TinyLoRA + GRPO: 239</title></rect>
  <text x="763.4" y="236.0" font-size="12.5" fill="#0b0b0b" text-anchor="start" font-weight="600">239</text>
  <text x="660.0" y="279.0" font-size="13" fill="#0b0b0b" text-anchor="end" font-weight="400">Opus weight edit</text>
  <rect x="670" y="264" width="58.6" height="22" rx="4" fill="#2a78d6" stroke="#2a78d6"><title>Opus weight edit: 164</title></rect>
  <text x="736.6" y="280.0" font-size="12.5" fill="#0b0b0b" text-anchor="start" font-weight="600">164</text>
  <text x="660.0" y="323.0" font-size="13" fill="#0b0b0b" text-anchor="end" font-weight="400">LoRA</text>
  <rect x="670" y="308" width="61.8" height="22" rx="4" fill="#2a78d6" stroke="#2a78d6"><title>LoRA: 173</title></rect>
  <text x="739.8" y="324.0" font-size="12.5" fill="#0b0b0b" text-anchor="start" font-weight="600">173</text>
  <rect x="660" y="52" width="14" height="14" rx="3" fill="#E5E7EB" stroke="#94a3b8"/>
  <text x="680.0" y="64.0" font-size="13" fill="#0b0b0b" text-anchor="start" font-weight="400">untrained</text>
  <rect x="770" y="52" width="14" height="14" rx="3" fill="#2a78d6"/>
  <text x="790.0" y="64.0" font-size="13" fill="#0b0b0b" text-anchor="start" font-weight="400">changed</text>
</svg></div>
<p>The average answer shrank from 650 characters to 179 (SFT) and 239 (GRPO), close to LoRA's 173. Shorter answers mean less to generate: answering the whole dev set took the base model 506 seconds, and the TinyLoRA models 118 (SFT) and 133 (GRPO). About 4 times faster.</p>
<p>That is a real behaviour change from 13 numbers. But it is the wrong change for BIRD: writing SQL first doesn't tell the model that <code>label</code> lives in the <code>molecule</code> table. In the error table above, TinyLoRA barely dented "no such column", while LoRA halved it.</p>
<h4>Did GRPO learn anything during training?</h4>
<p>A little. The reward is the share of each step's 64 sampled answers that were correct (<a href='#/blog/finetuning_series_2_how'>part 2</a> walks through the loop).</p>
<div style="overflow-x:auto;margin:1.9rem 0"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 440" style="width:100%;min-width:660px;height:auto;display:block" font-family="ui-sans-serif,system-ui,Helvetica,Arial,sans-serif" role="img" aria-label="TinyLoRA + GRPO: share of sampled answers that were correct">
  <rect width="1000" height="440" rx="14" fill="#FCFCFB" stroke="#E2E8F0" stroke-width="2"/>
  <text x="28" y="40" font-size="19" font-weight="700" fill="#0b0b0b">TinyLoRA + GRPO: share of sampled answers that were correct</text>
  <text x="28" y="64" font-size="14" fill="#52514e">Reward is 1 when the SQL returns the right rows. Each step draws new questions, so single steps are noisy.</text>
  <line x1="70" y1="370.0" x2="940" y2="370.0" stroke="#E8ECF2"/>
  <text x="60.0" y="374.0" font-size="12" fill="#52514e" text-anchor="end" font-weight="400">0%</text>
  <line x1="70" y1="318.4" x2="940" y2="318.4" stroke="#E8ECF2"/>
  <text x="60.0" y="322.4" font-size="12" fill="#52514e" text-anchor="end" font-weight="400">10%</text>
  <line x1="70" y1="266.8" x2="940" y2="266.8" stroke="#E8ECF2"/>
  <text x="60.0" y="270.8" font-size="12" fill="#52514e" text-anchor="end" font-weight="400">20%</text>
  <line x1="70" y1="215.2" x2="940" y2="215.2" stroke="#E8ECF2"/>
  <text x="60.0" y="219.2" font-size="12" fill="#52514e" text-anchor="end" font-weight="400">30%</text>
  <line x1="70" y1="163.6" x2="940" y2="163.6" stroke="#E8ECF2"/>
  <text x="60.0" y="167.6" font-size="12" fill="#52514e" text-anchor="end" font-weight="400">40%</text>
  <line x1="70" y1="112.0" x2="940" y2="112.0" stroke="#E8ECF2"/>
  <text x="60.0" y="116.0" font-size="12" fill="#52514e" text-anchor="end" font-weight="400">50%</text>
  <text x="70.0" y="392.0" font-size="12" fill="#52514e" text-anchor="middle" font-weight="400">1</text>
  <text x="234.6" y="392.0" font-size="12" fill="#52514e" text-anchor="middle" font-weight="400">15</text>
  <text x="410.9" y="392.0" font-size="12" fill="#52514e" text-anchor="middle" font-weight="400">30</text>
  <text x="587.3" y="392.0" font-size="12" fill="#52514e" text-anchor="middle" font-weight="400">45</text>
  <text x="763.6" y="392.0" font-size="12" fill="#52514e" text-anchor="middle" font-weight="400">60</text>
  <text x="940.0" y="392.0" font-size="12" fill="#52514e" text-anchor="middle" font-weight="400">75</text>
  <text x="505.0" y="416.0" font-size="13" fill="#52514e" text-anchor="middle" font-weight="400">GRPO step (each step: 8 questions x 8 sampled answers)</text>
  <polyline points="70.0,144.2 81.8,224.9 93.5,232.9 105.3,289.4 117.0,265.2 128.8,168.4 140.5,208.8 152.3,257.1 164.1,313.6 175.8,216.8 187.6,241.0 199.3,128.1 211.1,273.2 222.8,281.3 234.6,297.4 246.4,241.0 258.1,216.8 269.9,216.8 281.6,200.7 293.4,305.5 305.1,216.8 316.9,176.5 328.6,232.9 340.4,216.8 352.2,216.8 363.9,289.4 375.7,273.2 387.4,192.6 399.2,241.0 410.9,232.9 422.7,289.4 434.5,216.8 446.2,273.2 458.0,224.9 469.7,265.2 481.5,224.9 493.2,176.5 505.0,281.3 516.8,176.5 528.5,136.2 540.3,297.4 552.0,160.4 563.8,224.9 575.5,249.1 587.3,176.5 599.1,216.8 610.8,168.4 622.6,192.6 634.3,224.9 646.1,176.5 657.8,200.7 669.6,241.0 681.4,192.6 693.1,208.8 704.9,192.6 716.6,281.3 728.4,249.1 740.1,257.1 751.9,265.2 763.6,257.1 775.4,232.9 787.2,208.8 798.9,216.8 810.7,232.9 822.4,160.4 834.2,224.9 845.9,208.8 857.7,265.2 869.5,241.0 881.2,160.4 893.0,249.1 904.7,136.2 916.5,176.5 928.2,241.0 940.0,297.4" fill="none" stroke="#94a3b8" stroke-width="1.5"/>
  <polyline points="175.8,232.1 187.6,241.8 199.3,232.1 211.1,236.2 222.8,235.4 234.6,238.6 246.4,245.8 258.1,246.6 269.9,242.6 281.6,231.3 293.4,240.2 305.1,237.8 316.9,242.6 328.6,238.6 340.4,232.1 352.2,224.1 363.9,228.9 375.7,234.5 387.4,232.1 399.2,236.2 410.9,228.9 422.7,236.2 434.5,240.2 446.2,244.2 458.0,245.0 469.7,249.9 481.5,243.4 493.2,233.7 505.0,242.6 516.8,236.2 528.5,226.5 540.3,227.3 552.0,221.7 563.8,216.8 575.5,219.2 587.3,210.4 599.1,209.6 610.8,208.8 622.6,199.9 634.3,204.7 646.1,208.8 657.8,199.1 669.6,207.1 681.4,203.9 693.1,199.9 704.9,201.5 716.6,207.9 728.4,216.0 740.1,222.5 751.9,226.5 763.6,234.5 775.4,237.8 787.2,234.5 798.9,237.0 810.7,239.4 822.4,236.2 834.2,230.5 845.9,226.5 857.7,227.3 869.5,224.9 881.2,215.2 893.0,216.8 904.7,209.6 916.5,205.5 928.2,206.3 940.0,220.0" fill="none" stroke="#2a78d6" stroke-width="3" stroke-linejoin="round"/>
  <circle cx="70.0" cy="144.2" r="7" fill="transparent"><title>Step 1: 43.8% of answers correct</title></circle>
  <circle cx="81.8" cy="224.9" r="7" fill="transparent"><title>Step 2: 28.1% of answers correct</title></circle>
  <circle cx="93.5" cy="232.9" r="7" fill="transparent"><title>Step 3: 26.6% of answers correct</title></circle>
  <circle cx="105.3" cy="289.4" r="7" fill="transparent"><title>Step 4: 15.6% of answers correct</title></circle>
  <circle cx="117.0" cy="265.2" r="7" fill="transparent"><title>Step 5: 20.3% of answers correct</title></circle>
  <circle cx="128.8" cy="168.4" r="7" fill="transparent"><title>Step 6: 39.1% of answers correct</title></circle>
  <circle cx="140.5" cy="208.8" r="7" fill="transparent"><title>Step 7: 31.2% of answers correct</title></circle>
  <circle cx="152.3" cy="257.1" r="7" fill="transparent"><title>Step 8: 21.9% of answers correct</title></circle>
  <circle cx="164.1" cy="313.6" r="7" fill="transparent"><title>Step 9: 10.9% of answers correct</title></circle>
  <circle cx="175.8" cy="216.8" r="7" fill="transparent"><title>Step 10: 29.7% of answers correct</title></circle>
  <circle cx="187.6" cy="241.0" r="7" fill="transparent"><title>Step 11: 25.0% of answers correct</title></circle>
  <circle cx="199.3" cy="128.1" r="7" fill="transparent"><title>Step 12: 46.9% of answers correct</title></circle>
  <circle cx="211.1" cy="273.2" r="7" fill="transparent"><title>Step 13: 18.8% of answers correct</title></circle>
  <circle cx="222.8" cy="281.3" r="7" fill="transparent"><title>Step 14: 17.2% of answers correct</title></circle>
  <circle cx="234.6" cy="297.4" r="7" fill="transparent"><title>Step 15: 14.1% of answers correct</title></circle>
  <circle cx="246.4" cy="241.0" r="7" fill="transparent"><title>Step 16: 25.0% of answers correct</title></circle>
  <circle cx="258.1" cy="216.8" r="7" fill="transparent"><title>Step 17: 29.7% of answers correct</title></circle>
  <circle cx="269.9" cy="216.8" r="7" fill="transparent"><title>Step 18: 29.7% of answers correct</title></circle>
  <circle cx="281.6" cy="200.7" r="7" fill="transparent"><title>Step 19: 32.8% of answers correct</title></circle>
  <circle cx="293.4" cy="305.5" r="7" fill="transparent"><title>Step 20: 12.5% of answers correct</title></circle>
  <circle cx="305.1" cy="216.8" r="7" fill="transparent"><title>Step 21: 29.7% of answers correct</title></circle>
  <circle cx="316.9" cy="176.5" r="7" fill="transparent"><title>Step 22: 37.5% of answers correct</title></circle>
  <circle cx="328.6" cy="232.9" r="7" fill="transparent"><title>Step 23: 26.6% of answers correct</title></circle>
  <circle cx="340.4" cy="216.8" r="7" fill="transparent"><title>Step 24: 29.7% of answers correct</title></circle>
  <circle cx="352.2" cy="216.8" r="7" fill="transparent"><title>Step 25: 29.7% of answers correct</title></circle>
  <circle cx="363.9" cy="289.4" r="7" fill="transparent"><title>Step 26: 15.6% of answers correct</title></circle>
  <circle cx="375.7" cy="273.2" r="7" fill="transparent"><title>Step 27: 18.8% of answers correct</title></circle>
  <circle cx="387.4" cy="192.6" r="7" fill="transparent"><title>Step 28: 34.4% of answers correct</title></circle>
  <circle cx="399.2" cy="241.0" r="7" fill="transparent"><title>Step 29: 25.0% of answers correct</title></circle>
  <circle cx="410.9" cy="232.9" r="7" fill="transparent"><title>Step 30: 26.6% of answers correct</title></circle>
  <circle cx="422.7" cy="289.4" r="7" fill="transparent"><title>Step 31: 15.6% of answers correct</title></circle>
  <circle cx="434.5" cy="216.8" r="7" fill="transparent"><title>Step 32: 29.7% of answers correct</title></circle>
  <circle cx="446.2" cy="273.2" r="7" fill="transparent"><title>Step 33: 18.8% of answers correct</title></circle>
  <circle cx="458.0" cy="224.9" r="7" fill="transparent"><title>Step 34: 28.1% of answers correct</title></circle>
  <circle cx="469.7" cy="265.2" r="7" fill="transparent"><title>Step 35: 20.3% of answers correct</title></circle>
  <circle cx="481.5" cy="224.9" r="7" fill="transparent"><title>Step 36: 28.1% of answers correct</title></circle>
  <circle cx="493.2" cy="176.5" r="7" fill="transparent"><title>Step 37: 37.5% of answers correct</title></circle>
  <circle cx="505.0" cy="281.3" r="7" fill="transparent"><title>Step 38: 17.2% of answers correct</title></circle>
  <circle cx="516.8" cy="176.5" r="7" fill="transparent"><title>Step 39: 37.5% of answers correct</title></circle>
  <circle cx="528.5" cy="136.2" r="7" fill="transparent"><title>Step 40: 45.3% of answers correct</title></circle>
  <circle cx="540.3" cy="297.4" r="7" fill="transparent"><title>Step 41: 14.1% of answers correct</title></circle>
  <circle cx="552.0" cy="160.4" r="7" fill="transparent"><title>Step 42: 40.6% of answers correct</title></circle>
  <circle cx="563.8" cy="224.9" r="7" fill="transparent"><title>Step 43: 28.1% of answers correct</title></circle>
  <circle cx="575.5" cy="249.1" r="7" fill="transparent"><title>Step 44: 23.4% of answers correct</title></circle>
  <circle cx="587.3" cy="176.5" r="7" fill="transparent"><title>Step 45: 37.5% of answers correct</title></circle>
  <circle cx="599.1" cy="216.8" r="7" fill="transparent"><title>Step 46: 29.7% of answers correct</title></circle>
  <circle cx="610.8" cy="168.4" r="7" fill="transparent"><title>Step 47: 39.1% of answers correct</title></circle>
  <circle cx="622.6" cy="192.6" r="7" fill="transparent"><title>Step 48: 34.4% of answers correct</title></circle>
  <circle cx="634.3" cy="224.9" r="7" fill="transparent"><title>Step 49: 28.1% of answers correct</title></circle>
  <circle cx="646.1" cy="176.5" r="7" fill="transparent"><title>Step 50: 37.5% of answers correct</title></circle>
  <circle cx="657.8" cy="200.7" r="7" fill="transparent"><title>Step 51: 32.8% of answers correct</title></circle>
  <circle cx="669.6" cy="241.0" r="7" fill="transparent"><title>Step 52: 25.0% of answers correct</title></circle>
  <circle cx="681.4" cy="192.6" r="7" fill="transparent"><title>Step 53: 34.4% of answers correct</title></circle>
  <circle cx="693.1" cy="208.8" r="7" fill="transparent"><title>Step 54: 31.2% of answers correct</title></circle>
  <circle cx="704.9" cy="192.6" r="7" fill="transparent"><title>Step 55: 34.4% of answers correct</title></circle>
  <circle cx="716.6" cy="281.3" r="7" fill="transparent"><title>Step 56: 17.2% of answers correct</title></circle>
  <circle cx="728.4" cy="249.1" r="7" fill="transparent"><title>Step 57: 23.4% of answers correct</title></circle>
  <circle cx="740.1" cy="257.1" r="7" fill="transparent"><title>Step 58: 21.9% of answers correct</title></circle>
  <circle cx="751.9" cy="265.2" r="7" fill="transparent"><title>Step 59: 20.3% of answers correct</title></circle>
  <circle cx="763.6" cy="257.1" r="7" fill="transparent"><title>Step 60: 21.9% of answers correct</title></circle>
  <circle cx="775.4" cy="232.9" r="7" fill="transparent"><title>Step 61: 26.6% of answers correct</title></circle>
  <circle cx="787.2" cy="208.8" r="7" fill="transparent"><title>Step 62: 31.2% of answers correct</title></circle>
  <circle cx="798.9" cy="216.8" r="7" fill="transparent"><title>Step 63: 29.7% of answers correct</title></circle>
  <circle cx="810.7" cy="232.9" r="7" fill="transparent"><title>Step 64: 26.6% of answers correct</title></circle>
  <circle cx="822.4" cy="160.4" r="7" fill="transparent"><title>Step 65: 40.6% of answers correct</title></circle>
  <circle cx="834.2" cy="224.9" r="7" fill="transparent"><title>Step 66: 28.1% of answers correct</title></circle>
  <circle cx="845.9" cy="208.8" r="7" fill="transparent"><title>Step 67: 31.2% of answers correct</title></circle>
  <circle cx="857.7" cy="265.2" r="7" fill="transparent"><title>Step 68: 20.3% of answers correct</title></circle>
  <circle cx="869.5" cy="241.0" r="7" fill="transparent"><title>Step 69: 25.0% of answers correct</title></circle>
  <circle cx="881.2" cy="160.4" r="7" fill="transparent"><title>Step 70: 40.6% of answers correct</title></circle>
  <circle cx="893.0" cy="249.1" r="7" fill="transparent"><title>Step 71: 23.4% of answers correct</title></circle>
  <circle cx="904.7" cy="136.2" r="7" fill="transparent"><title>Step 72: 45.3% of answers correct</title></circle>
  <circle cx="916.5" cy="176.5" r="7" fill="transparent"><title>Step 73: 37.5% of answers correct</title></circle>
  <circle cx="928.2" cy="241.0" r="7" fill="transparent"><title>Step 74: 25.0% of answers correct</title></circle>
  <circle cx="940.0" cy="297.4" r="7" fill="transparent"><title>Step 75: 14.1% of answers correct</title></circle>
  <text x="169.8" y="254.1" font-size="13" fill="#0b0b0b" text-anchor="end" font-weight="600">26.7%</text>
  <text x="948.0" y="224.0" font-size="13" fill="#0b0b0b" text-anchor="start" font-weight="600">29.1%</text>
  <line x1="28" y1="90" x2="52" y2="90" stroke="#94a3b8" stroke-width="1.5"/>
  <text x="58.0" y="94.0" font-size="13" fill="#0b0b0b" text-anchor="start" font-weight="400">each step</text>
  <line x1="148" y1="90" x2="172" y2="90" stroke="#2a78d6" stroke-width="3"/>
  <text x="178.0" y="94.0" font-size="13" fill="#0b0b0b" text-anchor="start" font-weight="400">average of the last 10 steps</text>
</svg></div>
<p>Averaged over 10 steps, the reward went from 26.7% in the first ten steps to 29.1% in the last ten. Single steps jump around because each draws new questions, so I trust the average more. A small climb, in line with the dev result: a little better, but not clearly more than noise.</p>
<p>For the curious, these are all 13 numbers GRPO learned:</p>
<pre><code class='language-text'>0.012, -0.049, -0.020, -0.013, 0.058, -0.018, -0.090,
-0.015, 0.053, -0.008, -0.047, -0.046, -0.039</code></pre>
<p>And the 13 that SFT learned:</p>
<pre><code class='language-text'>-0.070, -0.024, 0.056, -0.053, 0.074, -0.066, 0.022,
0.109, -0.011, -0.003, 0.044, -0.067, 0.032</code></pre>
<p>That's the entire trained part of each model: all 196 adapted weight matrices get their update from the same 13 numbers (<a href='#/blog/finetuning_series_1_methods'>part 1</a> shows how).</p>
<h4>Why my result differs from the paper</h4>
<p>I don't think my result says the paper is wrong. I tested something different. My best guesses, most likely first:</p>
<ol>
<li><strong>The task needs knowledge, not a nudge.</strong> On GSM8K, the 7B model probably already knows how to do most of the math. A small push in the right direction ("think step by step, then answer in this format") can unlock it. BIRD needs facts about the databases: which columns exist, in which tables, what the values look like. Thirteen numbers can change a style. I doubt they can store a map of table layouts.</li>
<li><strong>A short RL run.</strong> My GRPO run was 75 steps over 600 questions. The paper trains for far longer. RL might pull ahead of SFT with a bigger budget.</li>
<li><strong>A smaller model.</strong> 1.5B parameters vs 7B. A bigger model may have more hidden ability for 13 numbers to unlock.</li>
</ol>
<h3>Bonus method 6: letting an LLM edit the weights</h3>
<p>While I was writing this up, MIT CSAIL published <a href='https://rikiyat.github.io/blog/weight-space-programming/' target='_blank' rel='noopener noreferrer'>Sparks of Weight-Space Programming</a>. Instead of gradient descent, a frontier LLM read a small model's raw weights and edited them by hand. On Qwen3.5-0.8B it found a "looping" direction in two MLP layers, subtracted it from 0.016% of the weights, and MATH-500 went from 7.9% to 48.1%. Their own caveat: the edit fixed a habit that stopped the model from finishing, it did not make the model better at math. I repeated the experiment on my model, with <strong>Claude Opus 5.5</strong> as the editor, running as an agent.</p>
<h4>The rules</h4>
<ul>
<li><strong>Read the weights, on CPU.</strong> A small Python library to load any weight matrix and compute whatever it likes: statistics, SVD, projections.</li>
<li><strong>25 forward passes</strong>, the only way to run the model. A pass either answers up to 512 practice questions with the original and the edited model side by side (graded), or records the model's inner activations on up to 1,024 texts.</li>
<li><strong>Practice on BIRD's training questions only.</strong> The dev set, the other methods' weights and all results were off limits. I checked its logs afterwards.</li>
<li><strong>No training.</strong> No gradients, no optimizer, no fitting weights to a loss. Edits go through a <code>save_edit()</code> function that refuses the embedding, the output layer, the final norm, and "multiply the whole matrix by a number".</li>
<li><strong>Explain every step</strong> in a lab notebook.</li>
</ul>
<h4>What it found</h4>
<p>It used 19 of its 25 passes, about an hour and a half in total. It started by reading failures and found the two habits from this post. For the wrong-table columns it traced the decision to a tug of war between attention heads and MLPs in layers 21 to 27, but every fix it tried broke about as many answers as it fixed on a fresh sample, so it threw them away.</p>
<p>The second habit was opening with "Let's walk through this..." instead of the SQL. The middle layers strongly prefer to start with <code>\`\`\`</code>, but a handful of neurons in the last MLP layers fire almost only at the first answer token and tip the model into prose. It also noticed this happens far more on long prompts.</p>
<p>The edit it submitted touches one matrix, the MLP output of the last layer (layer 27), and changes 32 of its 8,960 columns with a single rank-one patch:</p>
<pre><code class='language-python'>W = load("model.layers.27.mlp.down_proj.weight")
# k: "where" - fires at the first answer token, near 0 everywhere else
# u: "what"  - the smallest change that lowers "Let" and "Here" by 5 nats
#             while leaving the 400 most common tokens exactly as they were
W[:, S] += torch.outer(u, k[S])      # S = the 32 columns that matter most
save_edit("model.layers.27.mlp.down_proj.weight", W)</code></pre>
<p>Both vectors come from one step of linear algebra, not from training. 5 nats makes those two words about 150 times less likely at that one position. In total 48,398 weights changed, 0.003% of the model. On its practice questions the edit removed the habit but gained only about 1 question in 2,048, and it said so; it predicted any gain would show up on longer prompts.</p>
<h4>The result</h4>
<div style="overflow-x:auto;margin:1.9rem 0"><table><thead><tr><th>On the 1,534 dev questions</th><th class='num'>Base model</th><th class='num'>Opus weight edit</th></tr></thead><tbody>
<tr><td>Correct (EX)</td><td class='num'>437 (28.49%)</td><td class='num'>462 (30.12%)</td></tr>
<tr><td>Answers that start straight with the SQL</td><td class='num'>838</td><td class='num'>1,534 (all)</td></tr>
<tr><td>Answers that open with "Let..."</td><td class='num'>696</td><td class='num'>0</td></tr>
<tr><td>Average answer length</td><td class='num'>650 characters</td><td class='num'>164 characters</td></tr>
<tr><td>"no such column" errors</td><td class='num'>602</td><td class='num'>582</td></tr>
<tr><td>Time to answer all 1,534</td><td class='num'>506 s</td><td class='num'>113 s</td></tr>
</tbody></table></div>
<p>The habit is gone, completely. All of the accuracy gain comes from the 696 questions where the base model opened with "Let...": 163 correct before, 188 after. On the other 838 questions it is 274 before and 274 after. Its long-prompt prediction was right too: about half of the dev prompts are longer than any practice prompt (2,048 tokens), and three quarters of those long ones opened with "Let...", against 18% of the shorter ones.</p>
<h4>Running it longer</h4>
<p>MIT's best result needed 50 passes, and my editor stopped at 19. So a second run picked up from its edit with a much bigger budget: 84 passes in total, longer practice prompts (up to 3,072 tokens, like the dev set), and <strong>44 candidate edits</strong>, most of them aimed at the wrong-table columns. Each was tested against F4, the first run's edit, on 256 practice questions.</p>
<p>Three candidates looked like wins: 96, 95 and 93 correct against F4's 91. Then each was re-tested on 256 fresh questions, and all three lost or tied: 81, 83 and 88 against F4's 88. None was kept.</p>
<p>That is the <strong>winner's curse</strong>. Picture 44 fair coins, each flipped 256 times. By pure chance a few will land heads noticeably more than half the time, and if you only look at the best coins, they look special. Test 44 edits on small samples and some will "win" by luck. The fix is the one used here: never trust a winner until it wins again on questions it has never seen.</p>
<p>So I ran a third round under rules written down before any test: at most 4 candidate edits, each with a predicted effect, tested against F4 on 1,024 fresh practice questions no earlier run had seen, and kept only if the gain was clearly not luck (p &lt; 0.05). The editor tested one candidate. It had noticed that table names with spaces or hyphens, like <code>Store Locations</code> or <code>voice-actors</code>, must be wrapped in quotes in SQL, but the model copies them bare from the schema comments and the query crashes. It found a signal in the last layer that fires exactly where such a quote is needed, and added a second small patch (64 more columns, 96,429 weights) that pushes the quote character up by 4.5 nats, about 90 times more likely, at those spots only. On the fresh questions: 25 fixed, 7 broken, p = 0.002, inside the range it had predicted. The first confirmed gain from editing by hand.</p>
<p>Then the dev set: 30.05%, no change (15 fixed, 16 broken). The edit did not fail; the test set just rarely needs it. Of BIRD dev's 11 databases only one has a table name that needs quoting (<code>order</code>, a SQL keyword, in <code>financial</code>), and the bare name appears in 3 answers. That is the clearest lesson of method 6: a hand edit fixes exactly the habit you find, so it only pays off if your real data has that habit.</p>

<h4>How it compares</h4>
<p>It landed in the same place as TinyLoRA (30.12% vs 30.44%), for the same reason: it fixed the shape of the answer, not the model's knowledge of the databases. The two are still different models; they disagree on 217 questions. It is also the story MIT tells. Their looping stopped 93% of answers from ever finishing, so removing it unlocked a lot. My model's rambling usually still ended with a SQL block, so removing it unlocked little. Editing weights by hand can remove an obstacle you can see. It could not teach the model which column lives in which table.</p>
<h3>What it cost</h3>
<p>Accuracy is half the story. The other half: memory, time, and what you store afterwards. <a href='#/blog/finetuning_series_2_how'>Part 2</a> explains where the memory and time go.</p>
<div style="overflow-x:auto;margin:1.9rem 0"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 400" style="width:100%;min-width:660px;height:auto;display:block" font-family="ui-sans-serif,system-ui,Helvetica,Arial,sans-serif" role="img" aria-label="What each run cost on one 16 GB laptop GPU">
  <rect width="1000" height="400" rx="14" fill="#FCFCFB" stroke="#E2E8F0" stroke-width="2"/>
  <text x="28" y="40" font-size="19" font-weight="700" fill="#0b0b0b">What each run cost on one 16 GB laptop GPU</text>
  <text x="28" y="64" font-size="14" fill="#52514e">Peak GPU memory and wall-clock training time. GRPO also runs a second model copy to sample answers.</text>
  <text x="40.0" y="98.0" font-size="14" fill="#0b0b0b" text-anchor="start" font-weight="700">Peak GPU memory (GB)</text>
  <text x="180.0" y="131.0" font-size="13" fill="#0b0b0b" text-anchor="end" font-weight="400">Full fine-tune</text>
  <rect x="190" y="116" width="138.5" height="22" rx="4" fill="#2a78d6"><title>Full fine-tune: 7.6</title></rect>
  <text x="336.5" y="132.0" font-size="12.5" fill="#0b0b0b" text-anchor="start" font-weight="600">7.6 +3.1 in RAM</text>
  <text x="180.0" y="175.0" font-size="13" fill="#0b0b0b" text-anchor="end" font-weight="400">LoRA</text>
  <rect x="190" y="160" width="90.7" height="22" rx="4" fill="#2a78d6"><title>LoRA: 5.0</title></rect>
  <text x="288.7" y="176.0" font-size="12.5" fill="#0b0b0b" text-anchor="start" font-weight="600">5.0</text>
  <text x="180.0" y="219.0" font-size="13" fill="#0b0b0b" text-anchor="end" font-weight="400">LoRA-FA</text>
  <rect x="190" y="204" width="82.9" height="22" rx="4" fill="#2a78d6"><title>LoRA-FA: 4.6</title></rect>
  <text x="280.9" y="220.0" font-size="12.5" fill="#0b0b0b" text-anchor="start" font-weight="600">4.6</text>
  <text x="180.0" y="263.0" font-size="13" fill="#0b0b0b" text-anchor="end" font-weight="400">QLoRA</text>
  <rect x="190" y="248" width="73.1" height="22" rx="4" fill="#2a78d6"><title>QLoRA: 4.0</title></rect>
  <text x="271.1" y="264.0" font-size="12.5" fill="#0b0b0b" text-anchor="start" font-weight="600">4.0</text>
  <text x="180.0" y="307.0" font-size="13" fill="#0b0b0b" text-anchor="end" font-weight="400">TinyLoRA + SFT</text>
  <rect x="190" y="292" width="66.6" height="22" rx="4" fill="#2a78d6"><title>TinyLoRA + SFT: 3.7</title></rect>
  <text x="264.6" y="308.0" font-size="12.5" fill="#0b0b0b" text-anchor="start" font-weight="600">3.7</text>
  <text x="180.0" y="351.0" font-size="13" fill="#0b0b0b" text-anchor="end" font-weight="400">TinyLoRA + GRPO</text>
  <rect x="190" y="336" width="201.2" height="22" rx="4" fill="#2a78d6"><title>TinyLoRA + GRPO: 11.1</title></rect>
  <text x="399.2" y="352.0" font-size="12.5" fill="#0b0b0b" text-anchor="start" font-weight="600">11.1 incl. vLLM</text>
  <text x="520.0" y="98.0" font-size="14" fill="#0b0b0b" text-anchor="start" font-weight="700">Training time (minutes)</text>
  <text x="660.0" y="131.0" font-size="13" fill="#0b0b0b" text-anchor="end" font-weight="400">Full fine-tune</text>
  <rect x="670" y="116" width="51.9" height="22" rx="4" fill="#2a78d6"><title>Full fine-tune: 25.1</title></rect>
  <text x="729.9" y="132.0" font-size="12.5" fill="#0b0b0b" text-anchor="start" font-weight="600">25.1</text>
  <text x="660.0" y="175.0" font-size="13" fill="#0b0b0b" text-anchor="end" font-weight="400">LoRA</text>
  <rect x="670" y="160" width="64.8" height="22" rx="4" fill="#2a78d6"><title>LoRA: 31.3</title></rect>
  <text x="742.8" y="176.0" font-size="12.5" fill="#0b0b0b" text-anchor="start" font-weight="600">31.3</text>
  <text x="660.0" y="219.0" font-size="13" fill="#0b0b0b" text-anchor="end" font-weight="400">LoRA-FA</text>
  <rect x="670" y="204" width="63.2" height="22" rx="4" fill="#2a78d6"><title>LoRA-FA: 30.5</title></rect>
  <text x="741.2" y="220.0" font-size="12.5" fill="#0b0b0b" text-anchor="start" font-weight="600">30.5</text>
  <text x="660.0" y="263.0" font-size="13" fill="#0b0b0b" text-anchor="end" font-weight="400">QLoRA</text>
  <rect x="670" y="248" width="85.8" height="22" rx="4" fill="#2a78d6"><title>QLoRA: 41.4</title></rect>
  <text x="763.8" y="264.0" font-size="12.5" fill="#0b0b0b" text-anchor="start" font-weight="600">41.4</text>
  <text x="660.0" y="307.0" font-size="13" fill="#0b0b0b" text-anchor="end" font-weight="400">TinyLoRA + SFT</text>
  <rect x="670" y="292" width="61.4" height="22" rx="4" fill="#2a78d6"><title>TinyLoRA + SFT: 29.7</title></rect>
  <text x="739.4" y="308.0" font-size="12.5" fill="#0b0b0b" text-anchor="start" font-weight="600">29.7</text>
  <text x="660.0" y="351.0" font-size="13" fill="#0b0b0b" text-anchor="end" font-weight="400">TinyLoRA + GRPO</text>
  <rect x="670" y="336" width="265.3" height="22" rx="4" fill="#2a78d6"><title>TinyLoRA + GRPO: 128.1</title></rect>
  <text x="943.3" y="352.0" font-size="12.5" fill="#0b0b0b" text-anchor="start" font-weight="600">128.1</text>
</svg></div>
<div style="overflow-x:auto;margin:1.9rem 0"><table><thead><tr><th>Method</th><th class='num'>Train time</th><th class='num'>Peak GPU memory</th><th>What you save to disk</th></tr></thead><tbody>
<tr><td>Full fine-tuning</td><td class='num'>25.1 min</td><td class='num'>7.6 GB (+3.1 GB optimizer state in CPU RAM)</td><td>a whole new model, 2.9 GB</td></tr>
<tr><td>LoRA</td><td class='num'>31.3 min</td><td class='num'>5.0 GB</td><td>a 282 MB patch</td></tr>
<tr><td>LoRA-FA</td><td class='num'>30.5 min</td><td class='num'>4.6 GB</td><td>a 282 MB patch</td></tr>
<tr><td>QLoRA</td><td class='num'>41.4 min</td><td class='num'>4.0 GB</td><td>a 282 MB patch</td></tr>
<tr><td>TinyLoRA, SFT</td><td class='num'>29.7 min</td><td class='num'>3.7 GB</td><td>a 60 KB file</td></tr>
<tr><td>TinyLoRA, GRPO</td><td class='num'>128.1 min</td><td class='num'>11.1 GB (incl. vLLM)</td><td>a 60 KB file</td></tr>
</tbody></table></div>
<p>Notice what the parameter count does <em>not</em> buy you: <strong>13 trainable numbers is not cheap training</strong>. TinyLoRA-SFT took 29.7 minutes, about the same as LoRA's 31.3. Every training step still runs the full 1.5-billion-parameter model forward and backward. What you save is optimizer memory (3.7 GB vs 5.0 GB) and disk space, not compute.</p>
<p>GRPO was the most expensive run by far: 128 minutes and 11.1 GB, for the same score as the 30-minute SFT run.</p>
<h3>What I'd pick, and when</h3>
<ul>
<li><strong>Default: LoRA.</strong> Tied for the best score, half an hour, 5 GB, and a small patch you can add to or remove from the base model.</li>
<li><strong>Short on GPU memory: QLoRA.</strong> The same score with the least memory, but about a third slower to train. Serving in 4-bit costs around a point.</li>
<li><strong>Full fine-tuning: only if you can do it properly.</strong> That means enough memory for 32-bit master weights, and probably more steps. Done the cheap way, as I had to, it lost to LoRA.</li>
<li><strong>LoRA-FA:</strong> within 1.5 points of LoRA with 44% fewer trainable numbers. A fine option, but here QLoRA saved more memory and scored higher.</li>
<li><strong>TinyLoRA:</strong> for tiny behaviour changes, like answer format or length, not for teaching the model about the databases. To try it with RL, pick a task with an automatic grader that needs a skill the model mostly has already, and plan for a long run.</li>
<li><strong>Letting an LLM edit the weights:</strong> a promising tool for removing one specific habit you can see and measure, with no training run. It did not add knowledge here, and it needs a strong editor model and careful checking.</li>
</ul>
<h3>Fine-tune your own model: a checklist</h3>
<p>Everything this series taught me, in the order I would do it next time:</p>
<ol>
<li><strong>Measure the base model first, and read its failures.</strong> My biggest single lesson came from counting error types: 602 of 693 failed queries were "no such column". That told me what fine-tuning needed to fix.</li>
<li><strong>Build an automatic grader, then test the grader.</strong> Grade the gold answers against themselves; mine scored 1,532 of 1,534 and the two misses had an explanation. If the model's output is code, run it in a sandbox (<a href='#/blog/finetuning_series_2_how'>part 2</a>).</li>
<li><strong>Freeze a test set and never tune on it.</strong> Every choice (method, learning rate, which edit to keep) is made on training data. The test set is scored once at the end.</li>
<li><strong>Start with LoRA.</strong> Rank 16 to 64 on all linear layers, learning rate around 2e-4, loss only on the answer tokens. Switch to QLoRA if the model does not fit. Full fine-tuning only with memory to spare for 32-bit master weights.</li>
<li><strong>Keep everything else fixed when comparing.</strong> Same data, same order, same steps, same prompt. Otherwise you are comparing setups, not methods.</li>
<li><strong>Judge with paired counts, not averages.</strong> Count fixed vs broke questions and check whether the split could be a coin flip (McNemar's test, above).</li>
<li><strong>Confirm winners on fresh data.</strong> If you tried many variants, the best one is probably partly lucky (the winner's curse, above).</li>
<li><strong>Look at what changed, not just the score.</strong> TinyLoRA and the hand edit barely moved the score but changed every answer's format. That is a real effect, and you only see it by reading the outputs.</li>
</ol>

<h3>The infographic: what held, what didn't</h3>
<p>Back to the infographic from <a href='#/blog/finetuning_series_1_methods'>part 1</a>.</p>
<p><strong>What held up:</strong></p>
<ul>
<li>LoRA-style methods get most of the benefit while training a few percent of the weights. Here LoRA trained 4.8% and LoRA-FA 2.7%, more than the infographic's 70B figures (1.2% and 0.6%), because the percentage depends on model size, rank and which matrices you adapt.</li>
<li>QLoRA gives LoRA-level results with less memory, and LoRA-FA cuts trainable numbers with only a small loss.</li>
<li>TinyLoRA can change a model's behaviour with 13 numbers. The format shift is real and large.</li>
</ul>
<p><strong>What didn't hold up, on my task:</strong></p>
<ul>
<li><strong>The easy reading that more trainable numbers means better results.</strong> Full fine-tuning, squeezed into 16 GB, came last of the big methods.</li>
<li><strong>TinyLoRA only works with RL.</strong> SFT got exactly the same score as RL, in a quarter of the time. Neither gain was clearly more than luck.</li>
<li><strong>13 numbers as a way to teach a task.</strong> Enough to change the format. Not enough to learn which column lives in which table.</li>
</ul>
<h3>Caveats</h3>
<ul>
<li><strong>One run each.</strong> One training run, one seed per method. Another seed could move any method by a point or two; the McNemar tests don't cover that.</li>
<li><strong>A small training budget.</strong> Each supervised method saw 2,000 questions, once. Published LoRA runs on the full BIRD training set reach higher scores, and the ranking of methods could change with more data.</li>
<li><strong>A short GRPO run</strong> (75 steps), as noted above.</li>
<li><strong>Full fine-tuning had a handicap</strong>: 16-bit weights with no 32-bit master copy, as shown above. With a proper setup it would likely do better.</li>
<li><strong>BIRD's gold answers are not perfect.</strong> Some gold queries are wrong, and some hints don't match the data. For example, on question 275 the hint says a double bond is <code>bond_type = ' = '</code> (with spaces), but the database stores <code>'='</code>. All eight runs trusted the hint and got zero rows back. A few "misses" are the model disagreeing with a bad label, and a few "hits" are luck.</li>
<li><strong>My prompt is generous.</strong> It shows example values for every column, which makes the base model stronger. Some reports put this model near 17% on BIRD dev. My 28.49% baseline is not comparable to those, and fine-tuning gains might look different with a bare schema.</li>
<li><strong>Weight editing: one editor model, three rounds.</strong> 88 passes in total, all on BIRD's training databases. Habits found there do not always show up in the dev set, as round 3 showed.</li>
<li><strong>One task, one model.</strong> SQL on a 1.5B coding model, not math on the 7B or 70B models the paper and the infographic are about.</li>
</ul>
<h3>Links</h3>
<ul>
<li>Morris et al. 2026, <a href='https://arxiv.org/abs/2602.04118' target='_blank' rel='noopener noreferrer'>Learning to Reason in 13 Parameters</a> (arXiv:2602.04118), the TinyLoRA paper</li>
<li>Takehi, Teoh, Zhang and Khattab (MIT CSAIL) 2026, <a href='https://rikiyat.github.io/blog/weight-space-programming/' target='_blank' rel='noopener noreferrer'>Sparks of Weight-Space Programming</a>, the LLM weight-editing experiment</li>
<li><a href='https://bird-bench.github.io/' target='_blank' rel='noopener noreferrer'>BIRD text-to-SQL benchmark</a></li>
<li><a href='https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct' target='_blank' rel='noopener noreferrer'>Qwen2.5-Coder-1.5B-Instruct</a> on Hugging Face</li>
<li>Part 1 of this series: <a href='#/blog/finetuning_series_1_methods'>Fine-tuning, explained: 5 ways to teach a model</a></li>
<li>Part 2 of this series: <a href='#/blog/finetuning_series_2_how'>How I tested them: text-to-SQL on BIRD with one laptop GPU</a></li>
</ul>
<p><strong>Previous:</strong> <a href='#/blog/finetuning_series_2_how'>Part 2: How I tested them</a>. Or start from the beginning with <a href='#/blog/finetuning_series_1_methods'>Part 1: Fine-tuning, explained</a>.</p>

`,
};

export default post;
