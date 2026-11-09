import {
  mobile,
  backend,
  creator,
  web,
  airflow,
  ansible,
  bigquery,
  chromadb,
  docker,
  elasticsearch,
  expressjs,
  fastapi,
  flask,
  github,
  insomnia,
  javascript,
  jenkins,
  jupyter,
  kubernetes,
  java,
  kafka,
  kong,
  matplotlib,
  mongodb,
  nextjs,
  nodejs,
  numpy,
  openai,
  pandas,
  pinecone,
  pytorch,
  python,
  reactjs,
  redshift,
  scikitlearn,
  spark,
  springboot,
  sql,
  terraform,
  tailwind,
  spartan,
  sastra,
  bny,
  snowflake,
  elsevier,
  tcs,
  cts,
  accenture,
  ClaimsGuard,
  projWildTrace,
  projText2Sql,
  projKryptonxWatch,
  projCXRayGPT,
  projAries2,
  projFastF1,
  projMimic,
  projKayak,
  projAirbnb,
} from "../assets";

export const navLinks = [
  {
    id: "about",
    title: "About",
  },
  {
    id: "work",
    title: "Work",
  },
  {
    id: "blog",
    title: "Blog",
    url: "/blog"
  },
  {
    id: "contact",
    title: "Contact",
  },
];

const services = [
  {
    title: "AI & LLM Systems",
    icon: web,
    link: "https://github.com/shra012",
  },
  {
    title: "Problem Solving (DSA)",
    icon: mobile,
    link: "https://takeuforward.org/profile/shra012",
  },
  {
    title: "Backend & Data Platforms",
    icon: backend,
    link: "https://github.com/shra012",
  },
  {
    title: "LinkedIn",
    icon: creator,
    link: "https://www.linkedin.com/in/shravan-kumar12",
  },
];

export const technologies = [
  // Data Science & AI
  { name: "Java", icon: java },
  { name: "Spring Boot", icon: springboot },
  { name: "Python", icon: python },
  { name: "Pandas", icon: pandas },
  { name: "NumPy", icon: numpy },
  { name: "Matplotlib", icon: matplotlib },
  { name: "Jupyter", icon: jupyter },
  { name: "Scikit-learn", icon: scikitlearn },
  { name: "PyTorch", icon: pytorch },
  { name: "OpenAI", icon: openai },
  { name: "Pinecone", icon: pinecone },
  { name: "ChromaDB", icon: chromadb },

  // Frontend
  { name: "JavaScript", icon: javascript },
  { name: "React", icon: reactjs },
  { name: "Tailwind CSS", icon: tailwind },

  // Tools & Platforms
  { name: "Airflow", icon: airflow },
  { name: "Kafka", icon: kafka },
  { name: "Spark", icon: spark },
  { name: "Kong", icon: kong },
  { name: "Ansible", icon: ansible },
  { name: "Terraform", icon: terraform },
  { name: "Docker", icon: docker },
  { name: "Kubernetes", icon: kubernetes },
  { name: "Jenkins", icon: jenkins },
  { name: "GitHub", icon: github },
  { name: "Insomnia", icon: insomnia },

  // Backend & Databases
  { name: "Node.js", icon: nodejs },
  { name: "FastAPI", icon: fastapi },
  { name: "Flask", icon: flask },
  { name: "Express.js", icon: expressjs },
  { name: "MongoDB", icon: mongodb },
  { name: "MySQL", icon: sql },
  { name: "Elasticsearch", icon: elasticsearch },
  { name: "Redshift", icon: redshift },
  { name: "BigQuery", icon: bigquery },
];

const experiences = [
  {
    title: "Data Engineering Intern (MS Internship)",
    company_name: "Snowflake",
    icon: snowflake,
    iconBg: "#FFFFFF",
    date: "May 2026 - August 2026",
    points: [
      "Built an LLM-guided RBAC platform as a Snowflake Native App that turns natural-language access requests into automated provisioning plans, reducing manual effort and configuration errors.",
      "Guarded generated SQL with deterministic validators and prompt guardrails, raising pass@1 from 86% to 94% and blocking 100% of unsafe DDL/DML in evaluation; built the evaluation harness with pytest, Playwright, and Vitest.",
      "Added human-in-the-loop approval for low-confidence and high-risk operations across Slack, Jira, and Snowflake tasks, executing only on sign-off and cutting turnaround from days to minutes."
    ],
  },
  {
    title: "MS, Applied Data Intelligence",
    company_name: "San Jose State University",
    icon: spartan,
    iconBg: "#1A237E",
    date: "January 2025 - December 2026",
    points: [
      "Graduate work in machine learning, deep learning, generative and agentic AI, big data algorithms, distributed systems, and data warehousing.",
      "Instructional student assistant for DATA 220 (Mathematics for Data Analytics), DATA 226 (Data Warehousing and Pipelines), DATA 228 (Big Data), and CMPE 172 (Enterprise Software Systems).",
      "Built WildTrace, a robot-learning project: a calibrated Isaac Sim digital twin of a UFACTORY xArm 7 and an ACT imitation-learning policy that draws animal and human face sketches at 0.195 mm path error (versus 0.283 mm for inverse kinematics), deployed on the real arm.",
      "Independent research comparing six ways to adapt an LLM for text-to-SQL (full fine-tuning, LoRA, LoRA-FA, QLoRA, TinyLoRA with SFT and GRPO, and LLM-driven weight editing) on the BIRD benchmark; LoRA-family methods raised execution accuracy from 28.5% to 42.4%."
    ],
  },
  {
    title: "Lead Full Stack Developer",
    company_name: "The Bank of New York Mellon",
    icon: bny,
    iconBg: "#FFFFFF",
    date: "September 2022 - January 2025",
    points: [
      "Designed and built micro-frontends and middleware (React, Next.js, GraphQL, Express.js) that automate cloud provisioning, aggregate infrastructure metrics, and trigger Bash, Ansible, and Terraform workflows.",
      "Architected Spring Boot microservices with Spring Data and Spring Cloud (Eureka, Config Server, Consul), and automated CI/CD and infrastructure provisioning with Ansible, Packer, and Terraform.",
      "Contributed to the R&D design of a multi-agent autonomous operations system; built XGBoost, autoencoder, and LSTM models (PyTorch, scikit-learn) for capacity forecasting and anomaly detection, reducing false alerts by 35%."
    ],
  },
  {
    title: "Senior Software Engineer",
    company_name: "Elsevier",
    icon: elsevier,
    iconBg: "#FFFFFF",
    date: "July 2020 - September 2022",
    points: [
      "Ingested 12 TB of scholarly content from S3 into Elasticsearch with PySpark, Groovy, Kafka, and Kafka Connect, enabling sub-500 ms semantic search across 10M documents per day for Scopus and Mendeley researchers.",
      "Hardened an AWS Redshift star schema with monitoring and data-quality testing, improving reliability and reducing operational overhead.",
      "Built a reviewer-recommendation service that ranks peer reviewers with weighted scoring (FastAPI, MongoDB, PostgreSQL), deployed through Jenkins pipelines."
    ],
  },
  {
    title: "Senior Software Engineer",
    company_name: "Accenture",
    icon: accenture,
    iconBg: "#FFFFFF",
    date: "August 2019 - July 2020",
    points: [
      "Shipped 15+ microservices and 5+ micro-frontends for network monitoring in Scala, React, and Kafka on DataStax Enterprise Graph and Cassandra, processing millions of events per day, with Concourse CI/CD and Prometheus, Grafana, and Alerta telemetry that cut MTTR."
    ],
  },
  {
    title: "Associate",
    company_name: "Cognizant",
    icon: cts,
    iconBg: "#383E56",
    date: "March 2018 - August 2019",
    points: [
      "Delivered policy lifecycle workflows for a Guidewire InsuranceNow suite with jQuery and Angular UI modules, led the Maven-to-Gradle migration, and built a metrics framework that guided feature investment."
    ],
  },
  {
    title: "Systems Engineer",
    company_name: "Tata Consultancy Services",
    icon: tcs,
    iconBg: "#FFFFFF",
    date: "May 2015 - March 2018",
    points: [
      "Migrated a large retail platform from SOAP to REST, cutting p99 latency below 200 ms and doubling throughput through optimized Oracle PL/SQL and distributed caching; parallelized batch processing with multithreaded Spring Batch Integration microservices."
    ],
  },
  {
    title: "Bachelor of Technology, Mechanical Engineering",
    company_name: "SASTRA University",
    icon: sastra,
    iconBg: "#FFFFFF",
    date: "June 2011 - April 2015",
    points: [
      "Built strong engineering fundamentals and moved into software through programming in the final year."
    ],
  }
];

const projectCategories = ["AI/ML", "Data Engineering", "Software"];

const projects = [
  {
    name: "WildTrace: Robot Drawing",
    category: "AI/ML",
    description:
      "An imitation-learning policy (ACT) that drives a UFACTORY xArm 7 to draw animals and faces from photos. In a calibrated Isaac Sim digital twin it finishes all 48 test drawings at 0.195 mm path error versus 0.283 mm for inverse kinematics; on the real arm it finished 30 of 30 drawings at 0.53 mm. A FLUX, VLM-judge and LangGraph pipeline produced 2,874 validated pen-stroke trajectories; faces use MediaPipe landmarks.",
    tags: [
      { name: "isaac-sim", color: "green-text-gradient" },
      { name: "imitation-learning", color: "blue-text-gradient" },
      { name: "lerobot", color: "pink-text-gradient" },
      { name: "pytorch", color: "orange-text-gradient" },
      { name: "flux", color: "yellow-text-gradient" },
    ],
    image: projWildTrace,
    source_code_link: "https://github.com/shra012/WildTrace",
    live_demo_link: "https://github.com/shra012/WildTrace/blob/development/docs/readme/bird_live_edit.mp4",
    live_demo_label: "Watch the Real Arm",
  },
  {
    name: "text2sql-peft: Six Ways to Fine-Tune",
    category: "AI/ML",
    description:
      "Compared six ways to adapt Qwen2.5-Coder-1.5B for text-to-SQL on the BIRD benchmark, all on one 16 GB laptop GPU: full fine-tuning, LoRA, LoRA-FA, QLoRA, TinyLoRA with SFT and GRPO, and Claude Opus 5.5 editing the weights directly. QLoRA and LoRA lifted execution accuracy from 28.5% to about 42%; 13-parameter TinyLoRA and the LLM's hand edit fixed answer format but gained only about 2 points.",
    tags: [
      { name: "lora", color: "blue-text-gradient" },
      { name: "grpo", color: "green-text-gradient" },
      { name: "text-to-sql", color: "pink-text-gradient" },
      { name: "vllm", color: "orange-text-gradient" },
      { name: "pytorch", color: "yellow-text-gradient" },
    ],
    image: projText2Sql,
    source_code_link: "https://github.com/shra012/text2sql-peft",
    live_demo_link: "#/blog/finetuning_series_1_methods",
    live_demo_label: "Read the 3-part series",
  },
  {
    name: "Sentinel Machines (KryptonxWatch)",
    category: "AI/ML",
    description:
      "On-premises retail security video analysis on an HP ZGX Nano (NVIDIA GB10), built for the SJSU x HP Edge AI Hackathon. A local Qwen3-VL-30B-A3B matched Gemini 2.5 Flash at 81% balanced accuracy on a 36-clip UCF-Crime benchmark at zero API cost, answering each 8-second window in a median 2.1 s. YOLO11 boxes suspects, and a Next.js console queues every detection for human review.",
    tags: [
      { name: "vision-language-models", color: "blue-text-gradient" },
      { name: "edge-ai", color: "green-text-gradient" },
      { name: "nextjs", color: "pink-text-gradient" },
      { name: "yolo", color: "orange-text-gradient" },
      { name: "lora", color: "yellow-text-gradient" },
    ],
    image: projKryptonxWatch,
    source_code_link: "https://github.com/shra012/KryptonxWatch",
    live_demo_link: "https://www.youtube.com/watch?v=Mi7Q1wsWgcw",
    live_demo_label: "Demo video",
  },
  {
    name: "CXRayGPT: Chest X-ray Report Audit",
    category: "AI/ML",
    description:
      "Audited a Vicuna-based chest X-ray report generator on a leakage-free MIMIC-CXR benchmark (2,986 test studies, 289 patients). Across 15 ablation variants and 3 seeds, the full system beat a budget-matched XRayGPT retrain on CheXbert F1 (0.322 vs 0.259), but injected labels drove the gain: image tokens added a non-significant +0.005 and RAG cut F1 by 0.066. Its classifier trailed DenseNet-121 (AUROC 0.666 vs 0.781).",
    tags: [
      { name: "vision-language-models", color: "blue-text-gradient" },
      { name: "medical-imaging", color: "green-text-gradient" },
      { name: "qlora", color: "pink-text-gradient" },
      { name: "pytorch", color: "orange-text-gradient" },
      { name: "mimic-cxr", color: "yellow-text-gradient" },
    ],
    image: projCXRayGPT,
    source_code_link: "https://github.com/shra012/CXRayGPT",
  },
  {
    name: "ARIES 2 NPU Super-Resolution",
    category: "AI/ML",
    description:
      "Compiled a 0.66M-parameter image-restoration U-Net to INT8 for a Mobilint ARIES 2 NPU, reaching 24.66 dB test PSNR at 7.65 ms per 256x256 image, within 0.06 dB of the FP32 model. Built the PyTorch to ONNX opset 13 to MXQ pipeline with HWC export and calibration, distilled the model from a 9.6M-parameter MPRNet teacher, and trained a 41.9M-parameter NPU-safe FARU-Net over six phases.",
    tags: [
      { name: "edge-ai", color: "blue-text-gradient" },
      { name: "pytorch", color: "green-text-gradient" },
      { name: "onnx", color: "orange-text-gradient" },
      { name: "int8-quantization", color: "pink-text-gradient" },
      { name: "image-restoration", color: "yellow-text-gradient" },
    ],
    image: projAries2,
    source_code_link: "https://github.com/shra012/aries2-npu-super-resolution",
  },
  {
    name: "ClaimsGuard.ai",
    category: "AI/ML",
    description:
      "ClaimsGuard.ai is a React-based web application designed to streamline the process of validating medical claim codes. The application allows users to input claim data in JSON format, parse and validate the claims, and receive instant feedback on the validation results.",
    tags: [
      {
        name: "react",
        color: "blue-text-gradient",
      },
      {
        name: "python",
        color: "green-text-gradient",
      },
      {
        name: "pinecone",
        color: "orange-text-gradient",
      },
      {
        name: "chromadb",
        color: "pink-text-gradient",
      },
      {
        name: "openai",
        color: "black-text-gradient"
      }
    ],
    image: ClaimsGuard,
    source_code_link: "https://github.com/shra012/Commure-Hackathon",
    live_demo_link: "https://devpost.com/software/claimguardians",
  },
  {
    name: "Fast-F1 Streaming Analytics",
    category: "Data Engineering",
    description:
      "End-to-end streaming pipeline that replayed 1.1M+ Formula 1 telemetry messages and 2.3K race events from FastF1 through Kafka (Amazon MSK) and Spark Structured Streaming on EMR into an S3 Delta Lake and a Neo4j driver graph. The graph grew to 56 drivers, 37 sessions and 21,452 laps from the 2020-2025 seasons, with PageRank driver influence and a 100-edge battle and overtake network on a Neo4j dashboard. Terraform-managed AWS; four-person SJSU team project.",
    tags: [
      { name: "spark-streaming", color: "blue-text-gradient" },
      { name: "kafka", color: "green-text-gradient" },
      { name: "neo4j", color: "pink-text-gradient" },
      { name: "aws-emr", color: "orange-text-gradient" },
      { name: "terraform", color: "yellow-text-gradient" },
    ],
    image: projFastF1,
    source_code_link: "https://github.com/shra012/Fast-F1-Streaming-Analytics",
  },
  {
    name: "MIMIC-IV ICU Cost Warehouse",
    category: "Data Engineering",
    description:
      "Gives MIMIC-IV the cost layer it lacks: drug, lab and nurse-wage prices joined to ICU stays with PySpark on AWS Glue, landed as Parquet, and loaded into a Redshift star schema. The analysis found CCU stays averaging $49,854 against $25,654 in SICU, and cost per day falling from about $13,000 in 0-2 day stays to about $2,200 past 20 days.",
    tags: [
      { name: "pyspark", color: "orange-text-gradient" },
      { name: "aws-glue", color: "pink-text-gradient" },
      { name: "redshift", color: "blue-text-gradient" },
      { name: "star-schema", color: "green-text-gradient" },
      { name: "healthcare-data", color: "yellow-text-gradient" },
    ],
    image: projMimic,
    source_code_link: "https://github.com/shra012/mimic-iv-datawarehouse",
    live_demo_link: "#/blog/mimic_iv_cost_warehouse",
    live_demo_label: "Read the analysis",
  },
  {
    name: "Kayak Clone: Travel Booking Platform",
    category: "Software",
    description:
      "A Kayak-style platform for booking flights, hotels and cars, built by a six-person team. Express services exchange booking, payment and inventory events over 11 Kafka topics, with Redis caching, Postgres and MongoDB. I built most of the LangGraph concierge that turns plain-English trip requests into MongoDB and Supabase (MCP) queries, and also the EKS deployment and JMeter tests. In those tests, 300 concurrent search threads held 60 req/s with zero errors.",
    tags: [
      { name: "langgraph", color: "blue-text-gradient" },
      { name: "kafka", color: "green-text-gradient" },
      { name: "redis", color: "pink-text-gradient" },
      { name: "react", color: "orange-text-gradient" },
      { name: "aws-eks", color: "yellow-text-gradient" },
    ],
    image: projKayak,
    source_code_link: "https://github.com/shra012/Kayak-clone",
  },
  {
    name: "Airbnb Clone: Booking App with AI Concierge",
    category: "Software",
    description:
      "An Airbnb-style booking app for travelers and hosts, built with one teammate. A LangGraph concierge turns a booking and a free-text question into a day-by-day itinerary and packing list, drawing on Supabase POIs, Tavily search and weather forecasts, with Claude as fallback to OpenAI. Booking events flow through three Kafka topics to MongoDB and Socket.IO for live alerts. I wrote most of the API, React UI and AI service; it deploys to EKS with Helm.",
    tags: [
      { name: "langgraph", color: "blue-text-gradient" },
      { name: "kafka", color: "green-text-gradient" },
      { name: "react", color: "orange-text-gradient" },
      { name: "express", color: "pink-text-gradient" },
      { name: "aws-eks", color: "yellow-text-gradient" },
    ],
    image: projAirbnb,
    source_code_link: "https://github.com/shra012/Airbnb-clone",
  }
];

export { services, experiences, projects, projectCategories };
