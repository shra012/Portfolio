import legacyBlogData from './blog.json';

const blogData = [
  {
    id: 'mimic_iv_cost_warehouse',
    title: 'MIMIC-IV Records Everything About an ICU Stay Except What It Cost',
    date: 'August 21, 2026',
    aiSummary: 'Building an OLAP cost warehouse on a clinical dataset that ships no prices - the Glue/Redshift star schema, the join bias that makes the dollars directional, and why ICU cost turns out to be front-loaded.',
    content: `
<p>MIMIC-IV is one of the richest critical-care datasets in public research. It records lab results, prescriptions, ICU unit metadata, admission routes, discharge dispositions, and outcomes for de-identified patients at Beth Israel Deaconess Medical Center. It records almost everything about an ICU stay.</p>
<p>It does not record what any of it cost.</p>
<p>That gap is the whole project. Hospital administrators cannot see where ICU money goes in a form they can slice, and the best open dataset for studying ICU care is silent on price. So we built the missing half: an OLAP warehouse that joins MIMIC-IV clinical events to an externally sourced cost layer, and then asked it where the money actually goes.</p>
<p>This post is about what we built, the parts that were harder than expected, and what the numbers said once they existed - including the finding we deliberately do not trust.</p>

<h3>The pipeline</h3>
<p>The architecture is deliberately boring, because the interesting risk lives in the data, not the infrastructure.</p>
<div style="overflow-x:auto;margin:1.9rem 0"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 430" style="width:100%;min-width:660px;height:auto;display:block" font-family="ui-sans-serif,system-ui,Helvetica,Arial,sans-serif">
  <rect width="1000" height="430" rx="14" fill="#FCFCFB" stroke="#E2E8F0" stroke-width="2"/>
  <text x="28" y="40" font-size="19" font-weight="700" fill="#0b0b0b">Pipeline: clinical records in, priced star schema out</text>
  <text x="28" y="64" font-size="14" fill="#52514e">ELT - transform in Spark, land as Parquet, finish the aggregation in Redshift</text>

  <g stroke="#94a3b8" stroke-width="2" fill="none" marker-end="url(#ah)">
    <defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#94a3b8"/></marker></defs>
    <line x1="180" y1="140" x2="216" y2="140"/>
    <line x1="352" y1="140" x2="388" y2="140"/>
    <line x1="576" y1="140" x2="612" y2="140"/>
    <line x1="748" y1="140" x2="784" y2="140"/>
    <path d="M480 268 L480 178"/>
    <path d="M880 178 L880 300"/>
  </g>

  <g>
    <rect x="28" y="106" width="152" height="68" rx="10" fill="#EFF4FB" stroke="#2a78d6" stroke-width="2"/>
    <text x="104" y="134" font-size="14" font-weight="700" fill="#0b0b0b" text-anchor="middle">PhysioNet</text>
    <text x="104" y="154" font-size="12.5" fill="#52514e" text-anchor="middle">MIMIC-IV CSVs</text>

    <rect x="216" y="106" width="136" height="68" rx="10" fill="#EFF4FB" stroke="#2a78d6" stroke-width="2"/>
    <text x="284" y="134" font-size="14" font-weight="700" fill="#0b0b0b" text-anchor="middle">S3 raw</text>
    <text x="284" y="154" font-size="12.5" fill="#52514e" text-anchor="middle">hosp/ · icu/</text>

    <rect x="388" y="106" width="188" height="68" rx="10" fill="#2a78d6" stroke="#2a78d6" stroke-width="2"/>
    <text x="482" y="134" font-size="14" font-weight="700" fill="#ffffff" text-anchor="middle">AWS Glue · PySpark</text>
    <text x="482" y="154" font-size="12.5" fill="#DCE9F9" text-anchor="middle">join · normalize · price</text>

    <rect x="612" y="106" width="136" height="68" rx="10" fill="#EFF4FB" stroke="#2a78d6" stroke-width="2"/>
    <text x="680" y="134" font-size="14" font-weight="700" fill="#0b0b0b" text-anchor="middle">S3 Parquet</text>
    <text x="680" y="154" font-size="12.5" fill="#52514e" text-anchor="middle">columnar landing</text>

    <rect x="784" y="106" width="188" height="68" rx="10" fill="#2a78d6" stroke="#2a78d6" stroke-width="2"/>
    <text x="878" y="134" font-size="14" font-weight="700" fill="#ffffff" text-anchor="middle">Redshift</text>
    <text x="878" y="154" font-size="12.5" fill="#DCE9F9" text-anchor="middle">star schema · ROLLUP/CUBE</text>
  </g>

  <g>
    <rect x="330" y="268" width="300" height="86" rx="10" fill="#FDF0EA" stroke="#eb6834" stroke-width="2"/>
    <text x="480" y="294" font-size="13.5" font-weight="700" fill="#0b0b0b" text-anchor="middle">The cost layer MIMIC-IV does not ship</text>
    <text x="480" y="315" font-size="12.5" fill="#52514e" text-anchor="middle">Kaggle drug prices · FDA lab test costs</text>
    <text x="480" y="333" font-size="12.5" fill="#52514e" text-anchor="middle">state nurse wage reports</text>
  </g>

  <g>
    <rect x="784" y="300" width="188" height="62" rx="10" fill="#F1F5F9" stroke="#94a3b8" stroke-width="2"/>
    <text x="878" y="326" font-size="13.5" font-weight="700" fill="#0b0b0b" text-anchor="middle">Notebooks</text>
    <text x="878" y="345" font-size="12.5" fill="#52514e" text-anchor="middle">pandas · matplotlib · seaborn</text>
  </g>

  <text x="28" y="398" font-size="12.5" fill="#52514e">Whole pipeline runs locally in Docker on the public AWS Glue image - same PySpark, no cloud spend while iterating.</text>
</svg></div>
<p>Two details worth pulling out. First, this is <strong>ELT, not ETL</strong> - Spark does the joining and pricing, lands Parquet in S3, and Redshift does the final aggregation with ROLLUP and CUBE. Pushing the multidimensional work down to the warehouse is the entire point of having a warehouse; doing it in Spark and loading flat results would have wasted the engine.</p>
<p>Second, the whole thing runs locally in Docker on the public AWS Glue image. Same PySpark, same libraries, zero cloud spend while iterating. That single decision changed the development loop from <em>submit-and-wait-and-pay</em> to <em>run-it-again</em>, which matters more than it sounds when you are debugging a join that silently drops rows.</p>

<h3>The hard part: manufacturing a cost layer</h3>
<p>Since MIMIC-IV ships no prices, we assembled them: drug costs from a Kaggle pricing repository, lab test prices scraped from FDA regulatory documents, and nurse wage statistics from state-level healthcare wage reports.</p>
<p>Joining that to clinical records is where the real engineering lives. Drug names in prescriptions are free-text clinical strings; drug names in a pricing table are commercial product names. They agree often enough to be tempting and disagree often enough to be dangerous.</p>
<pre><code class='language-python'>medical_cost_df = medical_cost_df.withColumn("drug", lower(trim(col("drug"))))
prescriptions_df = prescriptions_df.withColumn("drug", lower(trim(col("drug"))))
lab_items_df = lab_items_df.withColumn("label", lower(trim(col("label"))))

medical_joined = medical_cost_df.alias("med").join(
    prescriptions_df.alias("pre"), ["drug"], "inner")
medicine_costs = medical_joined.groupBy("hadm_id").agg(
    F.sum(F.col("cost").cast("double")).alias("medicine_cost"))</code></pre>
<p>Normalize case, strip whitespace, join. It works - and it carries a bias you have to state out loud, because two lines later it becomes invisible:</p>
<pre><code class='language-python'>fact_icustay_enhanced = (fact_icustay
    .join(medicine_costs, fact_icustay.admission_id == medicine_costs.hadm_id, "left")
    .join(lab_costs, fact_icustay.admission_id == lab_costs.hadm_id, "left")
    .withColumn("lab_tests_cost", F.coalesce(F.col("lab_tests_cost"), F.lit(0)))
    .withColumn("medicine_cost", F.coalesce(F.col("medicine_cost"), F.lit(0)))
    .withColumn("total_cost", F.col("lab_tests_cost") + F.col("medicine_cost")))</code></pre>
<p>The <strong>inner</strong> join upstream drops every drug we could not price. The <strong>coalesce to zero</strong> downstream then converts that absence into a confident-looking <code>$0</code>. A stay where the patient received expensive unmatched medication is indistinguishable, in the fact table, from a stay where the patient received nothing at all.</p>
<p>This does not invalidate the analysis, but it fixes its interpretation: <strong>these numbers are directional, not billable.</strong> Relative comparisons between segments hold. Absolute dollars are a floor, not a total. Any conclusion that depends on the exact magnitude is a conclusion this pipeline cannot support, and saying so is cheaper than being quietly wrong.</p>

<h3>The model</h3>
<p>One fact table, one grain: a single ICU stay.</p>
<div style="overflow-x:auto;margin:1.9rem 0"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 540" style="width:100%;min-width:660px;height:auto;display:block" font-family="ui-sans-serif,system-ui,Helvetica,Arial,sans-serif">
  <rect width="1000" height="540" rx="14" fill="#FCFCFB" stroke="#E2E8F0" stroke-width="2"/>
  <text x="28" y="40" font-size="19" font-weight="700" fill="#0b0b0b">The star schema, with the columns that actually carry the analysis</text>
  <text x="28" y="64" font-size="14" fill="#52514e">One grain: a single ICU stay. Every cost measure hangs off that grain.</text>

  <g stroke="#94a3b8" stroke-width="2">
    <line x1="300" y1="150" x2="392" y2="232"/>
    <line x1="700" y1="150" x2="608" y2="232"/>
    <line x1="300" y1="432" x2="392" y2="356"/>
    <line x1="700" y1="432" x2="608" y2="356"/>
  </g>

  <g>
    <rect x="60" y="96" width="240" height="108" rx="10" fill="#EFF4FB" stroke="#2a78d6" stroke-width="2"/>
    <text x="76" y="122" font-size="14" font-weight="700" fill="#2a78d6">dim_patient</text>
    <text x="76" y="146" font-size="12.5" fill="#52514e">gender · race · age</text>
    <text x="76" y="166" font-size="12.5" fill="#52514e">marital_status · birth_year</text>
    <text x="76" y="190" font-size="11.5" fill="#94a3b8">from patients ⋈ admissions</text>
  </g>

  <g>
    <rect x="700" y="96" width="240" height="108" rx="10" fill="#EFF4FB" stroke="#2a78d6" stroke-width="2"/>
    <text x="716" y="122" font-size="14" font-weight="700" fill="#2a78d6">dim_admission</text>
    <text x="716" y="146" font-size="12.5" fill="#52514e">admission_type · source</text>
    <text x="716" y="166" font-size="12.5" fill="#52514e">insurance_category · drg_code</text>
    <text x="716" y="190" font-size="11.5" fill="#94a3b8">DRG joined from drgcodes</text>
  </g>

  <g>
    <rect x="60" y="432" width="240" height="86" rx="10" fill="#EFF4FB" stroke="#2a78d6" stroke-width="2"/>
    <text x="76" y="458" font-size="14" font-weight="700" fill="#2a78d6">dim_icu_unit</text>
    <text x="76" y="482" font-size="12.5" fill="#52514e">unit_type · unit_name</text>
    <text x="76" y="504" font-size="11.5" fill="#94a3b8">regex-parsed from first_careunit</text>
  </g>

  <g>
    <rect x="700" y="432" width="240" height="86" rx="10" fill="#EFF4FB" stroke="#2a78d6" stroke-width="2"/>
    <text x="716" y="458" font-size="14" font-weight="700" fill="#2a78d6">dim_date</text>
    <text x="716" y="482" font-size="12.5" fill="#52514e">year · quarter · month · dow</text>
    <text x="716" y="504" font-size="11.5" fill="#94a3b8">union of admit + discharge dates</text>
  </g>

  <g>
    <rect x="380" y="196" width="240" height="196" rx="12" fill="#2a78d6" stroke="#1f5da8" stroke-width="2"/>
    <text x="500" y="228" font-size="16" font-weight="700" fill="#ffffff" text-anchor="middle">fact_icustay</text>
    <line x1="400" y1="242" x2="600" y2="242" stroke="#7FB0E8" stroke-width="1.5"/>
    <text x="400" y="266" font-size="12.5" fill="#DCE9F9">patient_id · admission_id</text>
    <text x="400" y="288" font-size="12.5" fill="#DCE9F9">stay_id · total_icu_days</text>
    <text x="400" y="316" font-size="12.5" font-weight="700" fill="#ffffff">lab_tests_cost</text>
    <text x="400" y="338" font-size="12.5" font-weight="700" fill="#ffffff">medicine_cost</text>
    <text x="400" y="360" font-size="12.5" font-weight="700" fill="#ffffff">total_cost</text>
    <text x="400" y="382" font-size="12.5" fill="#F6C6AE">survived  ← see caveat</text>
  </g>
</svg></div>
<p>The dimensions are mostly straightforward joins, with one exception worth showing. ICU unit names in MIMIC-IV arrive as strings like <code>Medical Intensive Care Unit (MICU)</code> or <code>Medical/Surgical Intensive Care Unit (MICU/SICU)</code>. Getting a clean dimension out of that needed a small parser:</p>
<pre><code class='language-python'>def extract_icu_type(icu_name):
    match = re.search(r'\\((.*?)\\)', icu_name)
    if match:
        content = match.group(1)
        if content == "":
            return None
        elif "/" in content:
            return content.split("/")[0]
        return content
    return None</code></pre>
<p>Combined units collapse to their first listed type. That is a modelling choice, not a neutral one - a MICU/SICU stay gets counted as MICU - and it is the kind of decision that should live in a documented function rather than buried in a SQL <code>CASE</code> nobody rereads.</p>

<h3>What the data said</h3>
<div style="overflow-x:auto;margin:1.9rem 0"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 560" style="width:100%;min-width:660px;height:auto;display:block" font-family="ui-sans-serif,system-ui,Helvetica,Arial,sans-serif">
<rect width="1000" height="560" rx="14" fill="#FCFCFB" stroke="#E2E8F0" stroke-width="2"/>
<text x="28" y="40" font-size="19" font-weight="700" fill="#0b0b0b">Where the money went</text>
<text x="28" y="64" font-size="14" fill="#52514e">Same dollar scale across all three panels. n = ICU stays in each segment.</text>
<text x="28" y="100" font-size="14" font-weight="700" fill="#0b0b0b">Average total cost by ICU length of stay</text>
<text x="236" y="134" font-size="13" fill="#52514e" text-anchor="end">0-2 days</text>
<path d="M250,116 H529.0581818181818 A4,4 0 0 1 533.0581818181818,120 V138 A4,4 0 0 1 529.0581818181818,142 H250 Z" fill="#2a78d6"/>
<text x="545.0581818181818" y="134" font-size="13" font-weight="700" fill="#0b0b0b">$25,947</text>
<text x="625.0581818181818" y="134" font-size="12" fill="#94a3b8">n=77</text>
<text x="236" y="170" font-size="13" fill="#52514e" text-anchor="end">>20 days</text>
<path d="M250,152 H723.6654545454545 A4,4 0 0 1 727.6654545454545,156 V174 A4,4 0 0 1 723.6654545454545,178 H250 Z" fill="#2a78d6"/>
<text x="739.6654545454545" y="170" font-size="13" font-weight="700" fill="#0b0b0b">$43,786</text>
<text x="819.6654545454545" y="170" font-size="12" fill="#94a3b8">n=13</text>
<line x1="250" y1="116" x2="250" y2="178" stroke="#CBD5E1" stroke-width="1.5"/>
<text x="28" y="228" font-size="14" font-weight="700" fill="#0b0b0b">Average total cost by ICU unit type</text>
<text x="236" y="262" font-size="13" fill="#52514e" text-anchor="end">CCU</text>
<path d="M250,244 H789.8618181818182 A4,4 0 0 1 793.8618181818182,248 V266 A4,4 0 0 1 789.8618181818182,270 H250 Z" fill="#2a78d6"/>
<text x="805.8618181818182" y="262" font-size="13" font-weight="700" fill="#0b0b0b">$49,854</text>
<text x="885.8618181818182" y="262" font-size="12" fill="#94a3b8">n=13</text>
<text x="236" y="298" font-size="13" fill="#52514e" text-anchor="end">SICU</text>
<path d="M250,280 H525.8618181818182 A4,4 0 0 1 529.8618181818182,284 V302 A4,4 0 0 1 525.8618181818182,306 H250 Z" fill="#2a78d6"/>
<text x="541.8618181818182" y="298" font-size="13" font-weight="700" fill="#0b0b0b">$25,654</text>
<text x="621.8618181818182" y="298" font-size="12" fill="#94a3b8">n=29</text>
<line x1="250" y1="244" x2="250" y2="306" stroke="#CBD5E1" stroke-width="1.5"/>
<text x="28" y="356" font-size="14" font-weight="700" fill="#0b0b0b">Average total cost by insurance category</text>
<text x="236" y="390" font-size="13" fill="#52514e" text-anchor="end">Medicare</text>
<path d="M250,372 H717.8399999999999 A4,4 0 0 1 721.8399999999999,376 V394 A4,4 0 0 1 717.8399999999999,398 H250 Z" fill="#2a78d6"/>
<text x="733.8399999999999" y="390" font-size="13" font-weight="700" fill="#0b0b0b">$43,252</text>
<text x="813.8399999999999" y="390" font-size="12" fill="#94a3b8">n=99</text>
<text x="236" y="426" font-size="13" fill="#52514e" text-anchor="end">Other</text>
<path d="M250,408 H703.9745454545455 A4,4 0 0 1 707.9745454545455,412 V430 A4,4 0 0 1 703.9745454545455,434 H250 Z" fill="#2a78d6"/>
<text x="719.9745454545455" y="426" font-size="13" font-weight="700" fill="#0b0b0b">$41,981</text>
<text x="799.9745454545455" y="426" font-size="12" fill="#94a3b8">n=136</text>
<text x="236" y="462" font-size="13" fill="#52514e" text-anchor="end">Medicaid</text>
<path d="M250,444 H589.1454545454545 A4,4 0 0 1 593.1454545454545,448 V466 A4,4 0 0 1 589.1454545454545,470 H250 Z" fill="#2a78d6"/>
<text x="605.1454545454545" y="462" font-size="13" font-weight="700" fill="#0b0b0b">$31,455</text>
<text x="685.1454545454545" y="462" font-size="12" fill="#94a3b8">n=30</text>
<line x1="250" y1="372" x2="250" y2="470" stroke="#CBD5E1" stroke-width="1.5"/>
<text x="28" y="536" font-size="12.5" fill="#52514e">Cost = priced lab events + priced prescriptions. Labor is modelled separately and is not in these bars.</text>
</svg></div>
<p>Three things stand out.</p>
<p><strong>Long stays cost more in total.</strong> Stays over 20 days averaged <strong>$43,786</strong> against <strong>$25,947</strong> for stays of 0-2 days - roughly 1.7x. Unsurprising, and a useful sanity check that the pricing layer behaves.</p>
<p><strong>Unit type separates costs more sharply than length of stay does.</strong> CCU stays averaged <strong>$49,854</strong> against SICU's <strong>$25,654</strong> - nearly double, on segments of comparable size. Cardiac care is drug- and lab-intensive in a way surgical intensive care is not, and that shows up cleanly in the priced events.</p>
<p><strong>Payer category tracks cost.</strong> Medicare stays averaged <strong>$43,252</strong> against Medicaid's <strong>$31,455</strong>. This is the finding to handle most carefully: payer correlates with age, comorbidity, and admission route, so this is almost certainly a proxy for patient acuity rather than evidence of anything about the payers themselves. It is a starting question, not an answer.</p>

<h3>The result that surprised us</h3>
<p>Total cost rises with length of stay. <strong>Cost per day falls.</strong></p>
<p>Working it through with the segment averages: a 0-2 day stay at $25,947 runs on the order of <strong>$13,000 per day</strong>. A 20+ day stay at $43,786 spread across at least 20 days runs closer to <strong>$2,200 per day</strong> - an order-of-magnitude difference in daily burn, using the bucket boundaries as denominators.</p>
<p>The mechanism is intuitive once you see it: the diagnostic storm happens on admission. Panels get ordered, imaging gets done, broad-spectrum drugs get started. A patient on day 18 is being maintained, not investigated. <strong>ICU cost is front-loaded.</strong></p>
<p>The operational reading is the interesting part. If you want to reduce ICU spend, discharge optimization on long stays targets the cheapest days you have. The expensive decisions were made in the first 48 hours, and that is where diagnostic protocol work would actually pay.</p>

<h3>The result we do not trust</h3>
<div style="overflow-x:auto;margin:1.9rem 0"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 250" style="width:100%;min-width:660px;height:auto;display:block" font-family="ui-sans-serif,system-ui,Helvetica,Arial,sans-serif">
  <rect width="1000" height="250" rx="14" fill="#FCFCFB" stroke="#E2E8F0" stroke-width="2"/>
  <text x="28" y="40" font-size="19" font-weight="700" fill="#0b0b0b">Labor dominates the cost stack - and that is the least trustworthy number here</text>
  <text x="28" y="64" font-size="14" fill="#52514e">Share of modelled ICU cost. Labor is derived from static wage proxies, not observed shift data.</text>

  <g>
    <circle cx="34" cy="94" r="6" fill="#2a78d6"/>
    <text x="48" y="99" font-size="13" fill="#52514e">Labor (nurse wages × FTE proxy)</text>
    <circle cx="304" cy="94" r="6" fill="#eb6834"/>
    <text x="318" y="99" font-size="13" fill="#52514e">Supply (labs + drugs, priced per event)</text>
  </g>

  <path d="M28,120 H698 A6,6 0 0 1 704,126 V166 A6,6 0 0 1 698,172 H28 A6,6 0 0 1 22,166 V126 A6,6 0 0 1 28,120 Z" fill="#2a78d6"/>
  <path d="M712,120 H966 A6,6 0 0 1 972,126 V166 A6,6 0 0 1 966,172 H712 A6,6 0 0 1 706,166 V126 A6,6 0 0 1 712,120 Z" fill="#eb6834"/>

  <text x="44" y="148" font-size="15" font-weight="700" fill="#ffffff">≈ 70-80%</text>
  <text x="726" y="148" font-size="15" font-weight="700" fill="#ffffff">≈ 20-30%</text>

  <text x="28" y="208" font-size="13" fill="#0b0b0b" font-weight="700">Why we down-weighted this finding:</text>
  <text x="28" y="228" font-size="12.5" fill="#52514e">nurse-to-patient ratios were held constant, so labor scales almost linearly with length of stay by construction - the model cannot disagree with itself.</text>
</svg></div>
<p>Labor came out dominating the cost stack - and we down-weighted it in every conclusion, because the model cannot honestly disagree with itself here.</p>
<p>Nurse-to-patient ratios were held constant across the analysis. Labor cost is therefore, by construction, close to a linear function of length of stay. Feeding a constant multiplied by days into a model and then discovering that labor scales with days is not a finding; it is arithmetic wearing a finding's clothes.</p>
<p>Getting a real answer needs shift-level staffing data with acuity adjustment - which MIMIC-IV does not carry and which no public wage table can substitute for. The honest output here is a well-specified open question, not a number.</p>

<h3>The naming trap</h3>
<p>One detail from the fact table deserves its own note, because it cost us time and is entirely avoidable.</p>
<pre><code class='language-python'>F.col("adm.hospital_expire_flag").alias("survived")</code></pre>
<p>In MIMIC-IV, <code>hospital_expire_flag = 1</code> means the patient <em>died</em>. Aliasing that column to <code>survived</code> without inverting it means every downstream consumer reading a column called <code>survived</code> gets the opposite of what the name promises - and the values are still valid <code>0</code>s and <code>1</code>s, so nothing crashes and no test fails. It just quietly reverses a conclusion.</p>
<p><strong>Rename a column only when you also transform it.</strong> If the semantics did not change, keep the source name, however ugly. A derived column that lies about its own meaning is worse than one that is merely awkward to type.</p>

<h3>What I would do differently</h3>
<ul>
  <li><strong>Instrument the joins.</strong> Every lossy join should emit a match-rate metric into the pipeline output. We reasoned about drop rates after the fact; a <code>matched / total</code> counter written next to the Parquet would have made the coverage bias visible on run one instead of on review.</li>
  <li><strong>Model unmatched as null, not zero.</strong> Coalescing to <code>0</code> destroys the distinction between <em>no cost</em> and <em>no price available</em>. Nulls propagate honestly through aggregates; zeros silently deflate every average that touches them.</li>
  <li><strong>Version the cost layer.</strong> Prices came from three external sources with three different vintages. None of that provenance survives into the warehouse, which means the numbers cannot be reproduced against a known snapshot later.</li>
  <li><strong>Push the fuzzy matching upstream and materialize it.</strong> Drug-name reconciliation deserves to be its own reviewable mapping table with a confidence score per row - not an <code>inner</code> join buried in an ETL script.</li>
</ul>

<h3>The takeaway</h3>
<p>The engineering here was not the hard part. Glue, Spark, Parquet, and Redshift are well-worn tools and they behaved. The hard part was that the central quantity - cost - did not exist in the source data and had to be constructed, and every construction decision quietly became an analytical assumption.</p>
<p>The front-loading result is real and actionable. The unit-type spread is real and worth investigating. The labor dominance is an artifact of our own proxy. Knowing which is which is the actual deliverable, and it is the part that would have been easiest to skip.</p>
<p>Code, schema, and Glue jobs are on GitHub: <a href="https://github.com/shra012/mimic-iv-datawarehouse" target="_blank" rel="noopener noreferrer">shra012/mimic-iv-datawarehouse</a>.</p>
    `,
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1600',
    tags: ['Data Warehouse', 'AWS Glue', 'Redshift', 'PySpark', 'OLAP', 'Healthcare'],
    type: 'Article',
  },
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
