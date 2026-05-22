// src/lib/mockData.ts
// Central mock data store for NPrep QMS

export type TicketStatus = 'pending' | 'in_progress' | 'answered' | 'resolved';
export type UserRole = 'student' | 'faculty' | 'ops';

export const PAYOUT_RATE_PER_TICKET = 15; // ₹15 per resolved doubt

export const SUBJECTS = [
  'Anatomy',
  'Physiology',
  'Biochemistry',
  'Pharmacology',
  'Pathology',
  'Microbiology',
  'Community Health Nursing',
  'Medical-Surgical Nursing',
  'Pediatric Nursing',
  'OB/GYN Nursing',
];

export const TOPICS_BY_SUBJECT: Record<string, string[]> = {
  'Anatomy': ['Bones & Skeleton', 'Cardiovascular System', 'Nervous System', 'Respiratory System', 'Digestive System', 'Reproductive System', 'Muscular System', 'Lymphatic System'],
  'Physiology': ['Cell Physiology', 'Muscle Physiology', 'Renal Physiology', 'Cardiac Physiology', 'Respiratory Physiology', 'Endocrine Physiology', 'Acid-Base Balance'],
  'Biochemistry': ['Enzymes', 'Carbohydrate Metabolism', 'Lipid Metabolism', 'Protein Synthesis', 'DNA Replication', 'Vitamins & Minerals', 'Hormones'],
  'Pharmacology': ['Antibiotics', 'CNS Drugs', 'CVS Drugs', 'Analgesics', 'Antihypertensives', 'Antidiabetics', 'Anticoagulants', 'Drug Interactions'],
  'Pathology': ['Cell Injury', 'Inflammation', 'Neoplasia', 'Cardiovascular Pathology', 'Respiratory Pathology', 'Renal Pathology', 'Hepatic Pathology'],
  'Microbiology': ['Bacteria', 'Viruses', 'Fungi', 'Parasites', 'Immunity & Vaccines', 'Sterilization & Disinfection', 'Hospital Infections'],
  'Community Health Nursing': ['Epidemiology', 'Health Education', 'Family Health', 'School Health', 'Occupational Health', 'Maternal & Child Health', 'National Health Programs'],
  'Medical-Surgical Nursing': ['Pre-op Care', 'Post-op Care', 'Wound Management', 'IV Therapy', 'Pain Management', 'Fluid & Electrolyte Balance', 'Critical Care'],
  'Pediatric Nursing': ['Growth & Development', 'Neonatal Care', 'Immunization', 'Pediatric Emergencies', 'Nutritional Disorders', 'Congenital Disorders'],
  'OB/GYN Nursing': ['Antenatal Care', 'Labour & Delivery', 'Postnatal Care', 'Neonatal Resuscitation', 'Complications of Pregnancy', 'Contraception', 'Gynecological Disorders'],
};

export interface MockUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  avatar: string;
  batch?: string;
  college?: string;
  subject?: string;
  designation?: string;
}

export const MOCK_USERS: MockUser[] = [
  { id: 'stu-001', name: 'Priya Sharma', email: 'student@nprep.in', password: 'student123', role: 'student', avatar: 'PS', batch: 'B.Sc Nursing 2023', college: 'AIIMS Delhi' },
  { id: 'fac-001', name: 'Dr. Rajesh Kumar', email: 'faculty@nprep.in', password: 'faculty123', role: 'faculty', avatar: 'RK', subject: 'Pharmacology', designation: 'Senior Lecturer' },
  { id: 'ops-001', name: 'Ankit Verma', email: 'ops@nprep.in', password: 'ops123', role: 'ops', avatar: 'AV', designation: 'Operations Manager' },
];

export interface MockTicket {
  id: string;
  student_id: string;
  student_name: string;
  subject: string;
  topic: string;
  text_query: string;
  image_url?: string;
  status: TicketStatus;
  faculty_reply?: string;
  faculty_name?: string;
  faculty_id?: string;
  created_at: string;
  updated_at: string;
  similar_count: number;
  cluster_id?: string;
  dirty?: number;
}

export const MOCK_TICKETS: MockTicket[] = [
  {
    id: 'ticket-001',
    student_id: 'stu-001',
    student_name: 'Priya Sharma',
    subject: 'Pharmacology',
    topic: 'Antibiotics',
    text_query: 'What is the mechanism of action of beta-lactam antibiotics and why do they fail against MRSA? I read that penicillin binds to PBPs but I am confused about how MRSA develops resistance.',
    status: 'answered',
    faculty_reply: 'Great question! Beta-lactam antibiotics (penicillins, cephalosporins, carbapenems) work by binding to Penicillin Binding Proteins (PBPs) — enzymes responsible for the final step of peptidoglycan synthesis in bacterial cell walls. By inhibiting PBPs, bacteria cannot maintain cell wall integrity, leading to lysis and death.\n\nMRSA develops resistance through a unique mechanism: it produces an altered PBP called PBP2a (encoded by the mecA gene). PBP2a has very low affinity for all beta-lactam antibiotics, so the drug cannot bind effectively. This is why MRSA is resistant to ALL beta-lactams.\n\n🔑 Key point for exams: MRSA is treated with Vancomycin (glycopeptide) which works by binding to D-Ala-D-Ala terminus of peptidoglycan precursors — a completely different target.',
    faculty_name: 'Dr. Rajesh Kumar',
    faculty_id: 'fac-001',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    similar_count: 14,
    cluster_id: 'cluster-001',
    dirty: 0,
  },
  {
    id: 'ticket-002',
    student_id: 'stu-001',
    student_name: 'Priya Sharma',
    subject: 'Physiology',
    topic: 'Cardiac Physiology',
    text_query: "I'm confused about the Frank-Starling law. The textbook says 'the heart pumps what it receives' — can someone explain this with an example from a clinical scenario?",
    status: 'pending',
    faculty_reply: undefined,
    faculty_name: undefined,
    created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    similar_count: 8,
    cluster_id: 'cluster-002',
    dirty: 0,
  },
  {
    id: 'ticket-003',
    student_id: 'stu-002',
    student_name: 'Rahul Gupta',
    subject: 'Physiology',
    topic: 'Cardiac Physiology',
    text_query: "Can someone explain Frank-Starling law in simple terms? I understand preload increases stroke volume, but how does the heart muscle 'know' to contract more forcefully?",
    status: 'pending',
    created_at: new Date(Date.now() - 55 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 55 * 60 * 1000).toISOString(),
    similar_count: 8,
    cluster_id: 'cluster-002',
    dirty: 0,
  },
  {
    id: 'ticket-004',
    student_id: 'stu-003',
    student_name: 'Sneha Patel',
    subject: 'Physiology',
    topic: 'Cardiac Physiology',
    text_query: "Frank-Starling mechanism — exam tomorrow and I still don't understand. The heart contracts more when stretched? Why does this happen at the molecular level?",
    status: 'pending',
    created_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    similar_count: 8,
    cluster_id: 'cluster-002',
    dirty: 0,
  },
  {
    id: 'ticket-005',
    student_id: 'stu-004',
    student_name: 'Amit Singh',
    subject: 'Pharmacology',
    topic: 'Antibiotics',
    text_query: "Why don't beta-lactam antibiotics work for MRSA? Is it the same reason they don't work for Pseudomonas? I need a clear comparison.",
    status: 'pending',
    created_at: new Date(Date.now() - 100 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 100 * 60 * 1000).toISOString(),
    similar_count: 14,
    cluster_id: 'cluster-001',
    dirty: 0,
  },
  {
    id: 'ticket-006',
    student_id: 'stu-005',
    student_name: 'Meera Krishnan',
    subject: 'Biochemistry',
    topic: 'Carbohydrate Metabolism',
    text_query: "What is the significance of phosphofructokinase-1 in glycolysis? I know it's a key regulatory enzyme but don't understand how ATP inhibits it allosterically.",
    status: 'in_progress',
    faculty_reply: "PFK-1 is the rate-limiting enzyme of glycolysis. High ATP signals that the cell has enough energy, so ATP binds to an allosteric site on PFK-1, lowering its affinity for fructose-6-phosphate. This stops unnecessary glucose breakdown.",
    faculty_name: 'Dr. Anita Desai',
    faculty_id: 'fac-002',
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    similar_count: 6,
    cluster_id: 'cluster-003',
    dirty: 0,
  },
  {
    id: 'ticket-007',
    student_id: 'stu-006',
    student_name: 'Riya Mehta',
    subject: 'Pathology',
    topic: 'Inflammation',
    text_query: "What are the differences between acute and chronic inflammation? The textbook lists cardinal signs but I'm confused about the underlying cellular mechanisms and which cells predominate in each.",
    status: 'pending',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    similar_count: 22,
    cluster_id: 'cluster-004',
    dirty: 0,
  },
  {
    id: 'ticket-008',
    student_id: 'stu-007',
    student_name: 'Vikash Yadav',
    subject: 'Medical-Surgical Nursing',
    topic: 'IV Therapy',
    text_query: "What is the formula for calculating IV drip rate? I keep getting confused between macrodrip and microdrip sets and when to use each.",
    status: 'answered',
    faculty_reply: 'The IV drip rate formula:\n\n**Drops per minute = (Volume in mL × Drop factor) ÷ Time in minutes**\n\n🔵 Macrodrip (10, 15, or 20 gtt/mL): For adults, general IV fluids\n🟢 Microdrip (60 gtt/mL): Pediatric patients, precise drug delivery, ICU\n\nExample: 1000mL NS over 8 hours with macrodrip (15 gtt/mL)\n= (1000 × 15) ÷ (8 × 60) = 15000 ÷ 480 = 31.25 ≈ 31 drops/min\n\n💡 Memory tip: With microdrip, drops/min = mL/hour (because 60÷60 = 1:1 ratio). So if rate is 30mL/hr → 30 drops/min!',
    faculty_name: 'Dr. Rajesh Kumar',
    faculty_id: 'fac-001',
    created_at: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    similar_count: 31,
    cluster_id: 'cluster-005',
    dirty: 0,
  },
  {
    id: 'ticket-009',
    student_id: 'stu-008',
    student_name: 'Divya Nair',
    subject: 'Microbiology',
    topic: 'Bacteria',
    text_query: "What is the clinical significance of gram-positive vs gram-negative bacteria? I understand the staining but which antibiotics are we supposed to use for each type?",
    status: 'pending',
    created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    similar_count: 19,
    cluster_id: 'cluster-006',
    dirty: 0,
  },
  {
    id: 'ticket-010',
    student_id: 'stu-009',
    student_name: 'Karan Malhotra',
    subject: 'OB/GYN Nursing',
    topic: 'Labour & Delivery',
    text_query: "What are the stages of labour and how long does each stage typically last for a primigravida vs multigravida? I keep mixing up the times.",
    status: 'answered',
    faculty_reply: 'Stages of Labour:\n\n**Stage 1 — Cervical Dilation:**\n• Latent phase (0-4cm): Primigravida up to 8-12h | Multigravida up to 6-8h\n• Active phase (4-10cm): Primigravida ~1cm/hr | Multigravida ~1.5cm/hr\n\n**Stage 2 — Expulsion (Birth):**\n• Primigravida: up to 2 hours | Multigravida: up to 1 hour\n• With epidural: add 1 hour to each\n\n**Stage 3 — Placental Delivery:**\n• Both: 5-30 minutes\n\n**Stage 4 — Recovery:**\n• First 1-2 hours postpartum — critical for PPH monitoring!\n\n🩺 Nursing tip: Monitor every 15 min in Stage 1, every 5 min in Stage 2!',
    faculty_name: 'Dr. Rajesh Kumar',
    faculty_id: 'fac-001',
    created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 46 * 60 * 60 * 1000).toISOString(),
    similar_count: 27,
    cluster_id: 'cluster-007',
    dirty: 0,
  },
  {
    id: 'ticket-011',
    student_id: 'stu-010',
    student_name: 'Pooja Rawat',
    subject: 'Anatomy',
    topic: 'Nervous System',
    text_query: "What is the difference between UMN and LMN lesions? I always get confused about which has hyperreflexia and which has muscle wasting.",
    status: 'pending',
    created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    similar_count: 11,
    cluster_id: 'cluster-008',
    dirty: 0,
  },
  {
    id: 'ticket-012',
    student_id: 'stu-011',
    student_name: 'Suresh Kumar',
    subject: 'Pharmacology',
    topic: 'Antidiabetics',
    text_query: "What is the mechanism of metformin? Why is it first-line in T2DM when it doesn't stimulate insulin secretion unlike sulfonylureas?",
    status: 'pending',
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    similar_count: 9,
    cluster_id: 'cluster-009',
    dirty: 0,
  },
  {
    id: 'ticket-013',
    student_id: 'stu-012',
    student_name: 'Nandini Bhatt',
    subject: 'Community Health Nursing',
    topic: 'Epidemiology',
    text_query: "What is the difference between incidence and prevalence? I know incidence is new cases but the formula confuses me. Can you give a simple example?",
    status: 'pending',
    created_at: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(),
    similar_count: 16,
    cluster_id: 'cluster-010',
    dirty: 0,
  },
  {
    id: 'ticket-014',
    student_id: 'stu-013',
    student_name: 'Arjun Kapoor',
    subject: 'Pathology',
    topic: 'Neoplasia',
    text_query: "What are the key differences between benign and malignant tumors? I need the distinguishing features with examples for my exam.",
    status: 'pending',
    created_at: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
    similar_count: 25,
    cluster_id: 'cluster-011',
    dirty: 0,
  },
  {
    id: 'ticket-015',
    student_id: 'stu-001',
    student_name: 'Priya Sharma',
    subject: 'Anatomy',
    topic: 'Cardiovascular System',
    text_query: "Can you explain the conducting system of the heart? SA node, AV node, Bundle of His — I'm confused about the order, timing, and what happens during each step.",
    status: 'resolved',
    faculty_reply: 'The cardiac conducting system in order:\n\n1. **SA Node** — Pacemaker (60-100 bpm), right atrium near SVC\n2. **AV Node** — Delays impulse 0.1s to allow atrial filling. Floor of right atrium\n3. **Bundle of His** — Connects AV node to ventricular system\n4. **Right & Left Bundle Branches** — Down interventricular septum\n5. **Purkinje Fibers** — Fastest conduction (4m/s), spread to all ventricular muscle\n\n📊 ECG correlation:\n• P wave = Atrial depolarization\n• PR interval = AV node delay\n• QRS = Ventricular depolarization\n• T wave = Ventricular repolarization',
    faculty_name: 'Dr. Rajesh Kumar',
    faculty_id: 'fac-001',
    created_at: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 70 * 60 * 60 * 1000).toISOString(),
    similar_count: 18,
    cluster_id: 'cluster-012',
    dirty: 0,
  },
];

export interface MockCluster {
  cluster_id: string;
  subject: string;
  topic: string;
  representative_question: string;
  ticket_count: number;
  ticket_ids: string[];
  is_anomaly: boolean;
  created_at: string;
}

export const MOCK_CLUSTERS: MockCluster[] = [
  {
    cluster_id: 'cluster-002',
    subject: 'Physiology',
    topic: 'Cardiac Physiology',
    representative_question: 'Explain Frank-Starling law with a clinical example',
    ticket_count: 8,
    ticket_ids: ['ticket-002', 'ticket-003', 'ticket-004'],
    is_anomaly: false,
    created_at: new Date(Date.now() - 55 * 60 * 1000).toISOString(),
  },
  {
    cluster_id: 'cluster-001',
    subject: 'Pharmacology',
    topic: 'Antibiotics',
    representative_question: 'Why do beta-lactam antibiotics fail against MRSA?',
    ticket_count: 14,
    ticket_ids: ['ticket-005'],
    is_anomaly: true,
    created_at: new Date(Date.now() - 100 * 60 * 1000).toISOString(),
  },
  {
    cluster_id: 'cluster-004',
    subject: 'Pathology',
    topic: 'Inflammation',
    representative_question: 'Differences between acute and chronic inflammation mechanisms',
    ticket_count: 22,
    ticket_ids: ['ticket-007'],
    is_anomaly: true,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    cluster_id: 'cluster-006',
    subject: 'Microbiology',
    topic: 'Bacteria',
    representative_question: 'Gram-positive vs gram-negative — clinical significance and antibiotics',
    ticket_count: 19,
    ticket_ids: ['ticket-009'],
    is_anomaly: false,
    created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    cluster_id: 'cluster-008',
    subject: 'Anatomy',
    topic: 'Nervous System',
    representative_question: 'UMN vs LMN lesion — hyperreflexia vs muscle wasting',
    ticket_count: 11,
    ticket_ids: ['ticket-011'],
    is_anomaly: false,
    created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  },
  {
    cluster_id: 'cluster-003',
    subject: 'Biochemistry',
    topic: 'Carbohydrate Metabolism',
    representative_question: 'PFK-1 allosteric regulation in glycolysis',
    ticket_count: 6,
    ticket_ids: ['ticket-006'],
    is_anomaly: false,
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    cluster_id: 'cluster-009',
    subject: 'Pharmacology',
    topic: 'Antidiabetics',
    representative_question: "Metformin MOA — why first-line if it doesn't stimulate insulin?",
    ticket_count: 9,
    ticket_ids: ['ticket-012'],
    is_anomaly: false,
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
  {
    cluster_id: 'cluster-010',
    subject: 'Community Health Nursing',
    topic: 'Epidemiology',
    representative_question: 'Difference between incidence and prevalence with formulas',
    ticket_count: 16,
    ticket_ids: ['ticket-013'],
    is_anomaly: false,
    created_at: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(),
  },
  {
    cluster_id: 'cluster-011',
    subject: 'Pathology',
    topic: 'Neoplasia',
    representative_question: 'Benign vs malignant tumor — key distinguishing features',
    ticket_count: 25,
    ticket_ids: ['ticket-014'],
    is_anomaly: true,
    created_at: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
  },
];

export interface SimilarAnswer {
  id: string;
  question: string;
  answer_preview: string;
  subject: string;
  topic: string;
  resolved_at: string;
  similarity: number;
}

export const SIMILAR_ANSWERS: SimilarAnswer[] = [
  {
    id: 'ans-001',
    question: 'What is the mechanism of action of beta-lactam antibiotics?',
    answer_preview: 'Beta-lactam antibiotics work by binding to Penicillin Binding Proteins (PBPs) — enzymes responsible for peptidoglycan synthesis. By inhibiting PBPs, bacteria cannot maintain cell wall integrity...',
    subject: 'Pharmacology',
    topic: 'Antibiotics',
    resolved_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    similarity: 0.94,
  },
  {
    id: 'ans-002',
    question: "Why doesn't penicillin work against Staphylococcus aureus strains?",
    answer_preview: 'Many S. aureus strains produce beta-lactamase enzyme which breaks the beta-lactam ring of penicillin, rendering it inactive. MRSA additionally has PBP2a...',
    subject: 'Pharmacology',
    topic: 'Antibiotics',
    resolved_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    similarity: 0.87,
  },
  {
    id: 'ans-003',
    question: 'Explain Frank-Starling mechanism with preload and afterload',
    answer_preview: 'The Frank-Starling law states that stroke volume increases with venous return (preload). At the molecular level, increased stretch → more actin-myosin cross-bridges → stronger contraction...',
    subject: 'Physiology',
    topic: 'Cardiac Physiology',
    resolved_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    similarity: 0.91,
  },
];

export const MOCK_ANALYTICS = {
  kpis: {
    total_tickets: 1247,
    pending: 89,
    resolved_today: 34,
    avg_resolution_hours: 4.2,
    deflection_rate: 23,
    overdue_count: 12,
  },
  topic_volumes: [
    { topic: 'Cardiac Physiology', subject: 'Physiology', volume: 42, is_anomaly: false },
    { topic: 'Inflammation', subject: 'Pathology', volume: 88, is_anomaly: true },
    { topic: 'Beta-lactam Antibiotics', subject: 'Pharmacology', volume: 67, is_anomaly: true },
    { topic: 'IV Drip Rate', subject: 'Med-Surg Nursing', volume: 95, is_anomaly: true },
    { topic: 'Labour Stages', subject: 'OB/GYN Nursing', volume: 54, is_anomaly: false },
    { topic: 'Gram Staining', subject: 'Microbiology', volume: 38, is_anomaly: false },
    { topic: 'Glycolysis (PFK-1)', subject: 'Biochemistry', volume: 29, is_anomaly: false },
    { topic: 'UMN vs LMN', subject: 'Anatomy', volume: 45, is_anomaly: false },
    { topic: 'Metformin MOA', subject: 'Pharmacology', volume: 31, is_anomaly: false },
    { topic: 'Epidemiology Basics', subject: 'Community Health', volume: 22, is_anomaly: false },
  ],
  daily_trend: [
    { date: 'May 16', tickets: 145 },
    { date: 'May 17', tickets: 132 },
    { date: 'May 18', tickets: 178 },
    { date: 'May 19', tickets: 201 },
    { date: 'May 20', tickets: 189 },
    { date: 'May 21', tickets: 213 },
    { date: 'May 22', tickets: 189 },
  ],
  faculty_performance: [
    { id: 'fac-001', name: 'Dr. Rajesh Kumar', resolved: 28, avg_time_hours: 3.2, subjects: 'Pharmacology, Physiology', status: 'active' },
    { id: 'fac-002', name: 'Dr. Anita Desai', resolved: 19, avg_time_hours: 5.1, subjects: 'Pathology, Microbiology', status: 'active' },
    { id: 'fac-003', name: 'Prof. Suresh Menon', resolved: 12, avg_time_hours: 8.4, subjects: 'Anatomy, Biochemistry', status: 'idle' },
    { id: 'fac-004', name: 'Dr. Preethi Iyer', resolved: 22, avg_time_hours: 2.8, subjects: 'OB/GYN, Community Health', status: 'active' },
  ],
};

export function getStudentTickets(studentId: string): MockTicket[] {
  return MOCK_TICKETS.filter(t => t.student_id === studentId);
}

export function getPendingClusters(): MockCluster[] {
  return MOCK_CLUSTERS.sort((a, b) => b.ticket_count - a.ticket_count);
}

export function getOverdueTickets(): MockTicket[] {
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  return MOCK_TICKETS.filter(
    t => t.status === 'pending' && new Date(t.created_at).getTime() < cutoff
  );
}

export function searchSimilarAnswers(query: string): SimilarAnswer[] {
  if (query.length < 20) return [];
  const q = query.toLowerCase();
  // Very simple keyword matching for demo purposes
  return SIMILAR_ANSWERS.filter(ans =>
    ans.question.toLowerCase().split(' ').some(word => word.length > 4 && q.includes(word)) ||
    ans.subject.toLowerCase().split(' ').some(word => q.includes(word)) ||
    ans.topic.toLowerCase().split(' ').some(word => word.length > 3 && q.includes(word))
  );
}

export function formatTimeAgo(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}
