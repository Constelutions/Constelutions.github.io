/* ============================================================
   CONSTELUTIONS — localization (ES default · EN)
   HTML literal text is Spanish; this swaps to English on toggle.
   ============================================================ */
(function () {
  "use strict";

  var DICT = {
    /* ---- nav / global ---- */
    nav_home: { es: "Inicio", en: "Home" },
    nav_services: { es: "Servicios", en: "Services" },
    nav_portfolio: { es: "Portafolio", en: "Portfolio" },
    nav_about: { es: "Nosotros", en: "About" },
    nav_process: { es: "Proceso", en: "Process" },
    nav_team: { es: "Equipo", en: "Team" },
    nav_contact: { es: "Contacto", en: "Contact" },
    cta_book: { es: "Agenda una consulta", en: "Book a consultation" },
    cta_start: { es: "Iniciar proyecto", en: "Start a project" },
    cta_services: { es: "Ver servicios", en: "View services" },
    cta_talk: { es: "Hablemos", en: "Let's talk" },

    /* ---- hero ---- */
    hero_eyebrow: {
      es: "Desarrollo · Diseño · Integración",
      en: "Development · Design · Integration",
    },
    hero_head: {
      es: "Cada solución, una <em>constelación</em> de talento",
      en: "Every solution, a <em>constellation</em> of talent",
    },
    hero_lede: {
      es: "Conectamos ingeniería, diseño y estrategia para construir productos digitales que escalan. Un solo equipo, alineado a tus objetivos.",
      en: "We connect engineering, design and strategy to build digital products that scale. One team, aligned to your goals.",
    },

    /* ---- services grid ---- */
    svc_eyebrow: { es: "Qué hacemos", en: "What we do" },
    svc_title: {
      es: "Servicios que cubren todo el ciclo de tu producto",
      en: "Services that cover your product's full lifecycle",
    },
    svc_lede: {
      es: "Desde la primera línea de código hasta la operación en producción, te acompañamos en cada etapa.",
      en: "From the first line of code to production operations, we're with you at every stage.",
    },
    svc1_t: { es: "Desarrollo de Software", en: "Software Development" },
    svc1_d: {
      es: "Aplicaciones web y móviles a la medida, robustas y escalables, construidas con tecnología moderna.",
      en: "Custom web and mobile applications — robust, scalable, and built with modern technology.",
    },
    svc2_t: { es: "Diseño UI/UX", en: "UI/UX Design" },
    svc2_d: {
      es: "Interfaces claras y centradas en el usuario que convierten, desde la investigación hasta el prototipo final.",
      en: "Clear, user-centered interfaces that convert — from research to final prototype.",
    },
    svc3_t: { es: "Integración de APIs y Sistemas", en: "API & System Integrations" },
    svc3_d: {
      es: "Conectamos tus plataformas, servicios y datos en un ecosistema que funciona como uno solo.",
      en: "We connect your platforms, services and data into one ecosystem that works as a whole.",
    },
    svc4_t: { es: "Servicios de Consultoría", en: "Consulting Services" },
    svc4_d: {
      es: "Especialistas que elevan el estándar técnico de tu equipo en arquitectura, seguridad, DevOps y más.",
      en: "Specialists who raise your team's technical bar across architecture, security, DevOps and more.",
    },
    svc_more: { es: "Conocer más", en: "Learn more" },

    /* ---- consulting specialties ---- */
    spec_eyebrow: { es: "Consultoría especializada", en: "Specialized consulting" },
    spec_title: {
      es: "Ocho disciplinas para fortalecer tu operación técnica",
      en: "Eight disciplines to strengthen your technical operation",
    },
    spec_lede: {
      es: "Extiende tu equipo con expertos donde más lo necesitas — por proyecto o de forma continua.",
      en: "Extend your team with experts where you need them most — by project or on an ongoing basis.",
    },
    sp1_t: { es: "Arquitectura", en: "Architecture" },
    sp1_d: {
      es: "Diseño de sistemas escalables, resilientes y mantenibles.",
      en: "Scalable, resilient and maintainable system design.",
    },
    sp2_t: { es: "Automatización", en: "Automation" },
    sp2_d: {
      es: "CI/CD, IaC y flujos que eliminan el trabajo manual.",
      en: "CI/CD, IaC and pipelines that remove manual work.",
    },
    sp3_t: { es: "Revisión de Código", en: "Code Review" },
    sp3_d: {
      es: "Evaluación experta para elevar calidad y consistencia.",
      en: "Expert review to raise quality and consistency.",
    },
    sp4_t: { es: "Ciberseguridad", en: "Cyber Security" },
    sp4_d: {
      es: "Auditorías, buenas prácticas y protección de datos.",
      en: "Audits, best practices and data protection.",
    },
    sp5_t: { es: "Bases de Datos", en: "Databases" },
    sp5_d: {
      es: "Modelado, optimización y alta disponibilidad.",
      en: "Modeling, optimization and high availability.",
    },
    sp6_t: { es: "DevOps", en: "DevOps" },
    sp6_d: {
      es: "Entrega continua y operación confiable en la nube.",
      en: "Continuous delivery and reliable cloud operations.",
    },
    sp7_t: { es: "Observabilidad", en: "Observability" },
    sp7_d: {
      es: "Métricas, logs y trazas para ver todo tu sistema.",
      en: "Metrics, logs and traces to see your whole system.",
    },
    sp8_t: { es: "Rendimiento", en: "Performance" },
    sp8_d: {
      es: "Diagnóstico y tuning para sistemas rápidos y eficientes.",
      en: "Diagnosis and tuning for fast, efficient systems.",
    },

    /* ---- values / why us ---- */
    why_eyebrow: { es: "Por qué Constelutions", en: "Why Constelutions" },
    why_title: {
      es: "Un socio técnico en quien puedes confiar",
      en: "A technical partner you can trust",
    },
    why_lede: {
      es: "No solo entregamos software: construimos relaciones de largo plazo basadas en transparencia y resultados.",
      en: "We don't just ship software — we build long-term relationships based on transparency and results.",
    },
    val1_t: { es: "Equipo senior", en: "Senior team" },
    val1_d: {
      es: "Ingenieros y diseñadores con experiencia real en producción.",
      en: "Engineers and designers with real production experience.",
    },
    val2_t: { es: "Bilingüe ES / EN", en: "Bilingual ES / EN" },
    val2_d: {
      es: "Comunicación fluida con clientes en México, LATAM y EE. UU.",
      en: "Smooth communication with clients in Mexico, LATAM and the US.",
    },
    val3_t: { es: "Rigor de ingeniería", en: "Engineering rigor" },
    val3_d: {
      es: "Pruebas, revisión de código y estándares en cada entrega.",
      en: "Testing, code review and standards on every delivery.",
    },
    val4_t: { es: "Visión de largo plazo", en: "Long-term vision" },
    val4_d: {
      es: "Soluciones mantenibles que crecen junto con tu negocio.",
      en: "Maintainable solutions that grow with your business.",
    },

    /* ---- process ---- */
    proc_eyebrow: { es: "Cómo trabajamos", en: "How we work" },
    proc_title: {
      es: "Un proceso claro, de la idea a producción",
      en: "A clear process, from idea to production",
    },
    proc_lede: {
      es: "Metodología ágil con entregas continuas y visibilidad total en cada paso.",
      en: "Agile methodology with continuous delivery and full visibility at every step.",
    },
    st1_t: { es: "Descubrimiento", en: "Discovery" },
    st1_d: {
      es: "Entendemos tu negocio, objetivos y requisitos técnicos.",
      en: "We understand your business, goals and technical requirements.",
    },
    st2_t: { es: "Diseño", en: "Design" },
    st2_d: {
      es: "Definimos arquitectura y experiencia antes de escribir código.",
      en: "We define architecture and experience before writing code.",
    },
    st3_t: { es: "Desarrollo", en: "Development" },
    st3_d: {
      es: "Construimos en ciclos cortos con demos frecuentes.",
      en: "We build in short cycles with frequent demos.",
    },
    st4_t: { es: "Integración", en: "Integration" },
    st4_d: {
      es: "Conectamos sistemas y aseguramos calidad con pruebas.",
      en: "We connect systems and ensure quality with testing.",
    },
    st5_t: { es: "Lanzamiento", en: "Launch" },
    st5_d: {
      es: "Desplegamos con confianza y pipelines automatizados.",
      en: "We deploy with confidence and automated pipelines.",
    },
    st6_t: { es: "Soporte", en: "Support" },
    st6_d: {
      es: "Monitoreo, mejoras y acompañamiento continuo.",
      en: "Monitoring, improvements and ongoing support.",
    },

    /* ---- tech ---- */
    tech_eyebrow: { es: "Stack tecnológico", en: "Tech stack" },
    tech_title: {
      es: "Herramientas modernas, elegidas con criterio",
      en: "Modern tools, chosen with intent",
    },
    tech_lede: {
      es: "Seleccionamos cada tecnología según las necesidades del proyecto, no por moda.",
      en: "We pick each technology to fit the project, not the trend.",
    },
    tech_frontend: { es: "Frontend", en: "Frontend" },
    tech_backend: { es: "Backend", en: "Backend" },
    tech_mobile: { es: "Móvil", en: "Mobile" },
    tech_database: { es: "Base de datos", en: "Databases" },
    tech_cloud: { es: "Nube & DevOps", en: "Cloud & DevOps" },

    /* ---- stats ---- */
    stat1_l: { es: "Servicios principales", en: "Core services" },
    stat2_l: { es: "Especialidades de consultoría", en: "Consulting specialties" },
    stat3_l: { es: "Equipo bilingüe", en: "Bilingual team" },
    stat4_l: { es: "Enfocados en tu éxito", en: "Focused on your success" },

    /* ---- testimonials ---- */
    test_eyebrow: { es: "Lo que dicen", en: "What they say" },
    test_title: {
      es: "Confianza que se construye proyecto a proyecto",
      en: "Trust built one project at a time",
    },
    q1: {
      es: "Constelutions entendió nuestra operación desde el primer día y entregó una plataforma que nuestro equipo realmente usa.",
      en: "Constelutions understood our operation from day one and delivered a platform our team actually uses.",
    },
    q2: {
      es: "El nivel técnico y la comunicación fueron excepcionales. Se sintieron como parte de nuestro equipo.",
      en: "The technical level and communication were exceptional. They felt like part of our team.",
    },
    q3: {
      es: "Modernizamos sistemas críticos sin interrumpir la operación. Resultados claros y medibles.",
      en: "We modernized critical systems with zero downtime. Clear, measurable results.",
    },
    q1_n: { es: "Nombre Apellido", en: "Name Surname" },
    q1_r: { es: "Dirección de Operaciones", en: "Head of Operations" },
    q2_n: { es: "Nombre Apellido", en: "Name Surname" },
    q2_r: { es: "CTO, Empresa de Tecnología", en: "CTO, Technology Company" },
    q3_n: { es: "Nombre Apellido", en: "Name Surname" },
    q3_r: { es: "Gerente de TI", en: "IT Manager" },
    test_note: {
      es: "Testimonios de ejemplo — reemplázalos con reseñas reales de tus clientes.",
      en: "Sample testimonials — replace with real client reviews.",
    },

    /* ---- about page head ---- */
    about_title: {
      es: "El equipo detrás de cada constelación",
      en: "The team behind every constellation",
    },
    about_lede: {
      es: "Conoce quiénes somos, de dónde venimos y qué nos mueve a construir software con rigor y propósito.",
      en: "Learn who we are, where we come from and what drives us to build software with rigour and purpose.",
    },

    /* ---- portfolio page ---- */
    port_title: {
      es: "Productos reales, impacto medible",
      en: "Real products, measurable impact",
    },
    port_lede: {
      es: "Una selección de los sistemas, plataformas y aplicaciones que hemos construido para clientes en distintas industrias.",
      en: "A selection of the systems, platforms and applications we have built for clients across industries.",
    },

    proj_eyebrow: { es: "Proyectos destacados", en: "Featured projects" },
    proj_title: { es: "Lo que hemos construido", en: "What we have built" },
    proj_lede: {
      es: "Sistemas en producción que procesan transacciones reales, sirven a usuarios reales y generan resultados medibles para nuestros clientes.",
      en: "Production systems that process real transactions, serve real users and generate measurable results for our clients.",
    },
    proj_screenshot: { es: "Captura de pantalla", en: "Screenshot" },
    proj_note: {
      es: "Proyectos representativos — los nombres de clientes se omiten por confidencialidad.",
      en: "Representative projects — client names omitted for confidentiality.",
    },

    proj1_industry: { es: "Fintech", en: "Fintech" },
    proj1_title: { es: "Plataforma de pagos y conciliación", en: "Payments & reconciliation platform" },
    proj1_desc: {
      es: "Sistema de procesamiento de pagos en tiempo real con motor de conciliación automática, paneles de control para operadores y API pública para integraciones de terceros.",
      en: "Real-time payment processing system with automatic reconciliation engine, operator dashboards and a public API for third-party integrations.",
    },
    proj1_outcome: { es: "Reducción del 70 % en errores de conciliación manual", en: "70 % reduction in manual reconciliation errors" },

    proj2_industry: { es: "Salud", en: "Healthcare" },
    proj2_title: { es: "Expediente clínico electrónico", en: "Electronic medical record system" },
    proj2_desc: {
      es: "Solución de expediente clínico para red de clínicas privadas: historial de pacientes, agenda de citas, recetas digitales y módulo de facturación integrado con el SAT.",
      en: "Clinical record solution for a private clinic network: patient history, appointment scheduling, digital prescriptions and a billing module integrated with the tax authority.",
    },
    proj2_outcome: { es: "Digitalización de 120 000 expedientes en 3 clínicas", en: "120,000 records digitized across 3 clinics" },

    proj3_industry: { es: "Logística", en: "Logistics" },
    proj3_title: { es: "Sistema de rastreo de flotilla en tiempo real", en: "Real-time fleet tracking system" },
    proj3_desc: {
      es: "Plataforma de monitoreo de vehículos con mapa en tiempo real, alertas por geocerca, reportes de eficiencia de rutas y app móvil para conductores.",
      en: "Vehicle monitoring platform with real-time map, geofence alerts, route efficiency reports and a mobile app for drivers.",
    },
    proj3_outcome: { es: "Visibilidad al 100 % sobre 400 unidades activas", en: "100 % visibility across 400 active units" },

    proj4_industry: { es: "E-commerce", en: "E-commerce" },
    proj4_title: { es: "Marketplace B2B con catálogo inteligente", en: "B2B marketplace with smart catalogue" },
    proj4_desc: {
      es: "Marketplace mayorista con catálogo configurable, motor de precios por volumen, integración con ERP y flujo de aprobación de órdenes a medida.",
      en: "Wholesale marketplace with a configurable catalogue, volume pricing engine, ERP integration and a custom order approval workflow.",
    },
    proj4_outcome: { es: "3× crecimiento en volumen de órdenes en el primer año", en: "3× growth in order volume in the first year" },

    demos_eyebrow: { es: "Demos en vivo", en: "Live demos" },
    demos_title: { es: "Mira nuestro trabajo en acción", en: "See our work in action" },
    demos_lede: {
      es: "Aplicaciones funcionales que puedes explorar ahora mismo. Cada demo refleja patrones reales que aplicamos en proyectos de clientes.",
      en: "Functional applications you can explore right now. Each demo reflects real patterns we apply on client projects.",
    },
    demo_screenshot: { es: "Demo en vivo próximamente", en: "Live demo coming soon" },
    demo_soon: { es: "Próximamente", en: "Coming soon" },
    demo_note: {
      es: "Los demos estarán disponibles próximamente — contáctanos si quieres ver una demostración en vivo.",
      en: "Demos coming soon — contact us if you'd like to see a live walkthrough.",
    },
    demo_type_web: { es: "App web", en: "Web app" },
    demo_type_mobile: { es: "App móvil", en: "Mobile app" },
    demo_type_api: { es: "API / Backend", en: "API / Backend" },

    demo1_title: { es: "Dashboard de analíticas en tiempo real", en: "Real-time analytics dashboard" },
    demo1_desc: {
      es: "Visualización de KPIs, gráficas de series de tiempo y filtros dinámicos. Construido con React y un backend de WebSockets.",
      en: "KPI visualisation, time-series charts and dynamic filters. Built with React and a WebSocket backend.",
    },
    demo2_title: { es: "App móvil de gestión de campo", en: "Field management mobile app" },
    demo2_desc: {
      es: "Aplicación offline-first para técnicos de campo: captura de formularios, firma digital y sincronización automática al recuperar señal.",
      en: "Offline-first application for field technicians: form capture, digital signature and automatic sync on reconnection.",
    },
    demo3_title: { es: "Portal de autoservicio para clientes", en: "Customer self-service portal" },
    demo3_desc: {
      es: "Portal B2C con autenticación, historial de órdenes, descarga de facturas y chat de soporte integrado.",
      en: "B2C portal with authentication, order history, invoice downloads and integrated support chat.",
    },
    demo4_title: { es: "API de integración ERP ↔ e-commerce", en: "ERP ↔ e-commerce integration API" },
    demo4_desc: {
      es: "Middleware que sincroniza inventario, precios y órdenes entre un ERP legacy y una tienda en línea. Documentación interactiva incluida.",
      en: "Middleware that syncs inventory, pricing and orders between a legacy ERP and an online store. Interactive documentation included.",
    },
    demo5_title: { es: "Sistema de notificaciones multicanal", en: "Multi-channel notification system" },
    demo5_desc: {
      es: "Motor de notificaciones configurable vía reglas: email, SMS, push y webhooks. Panel de administración con métricas de entrega.",
      en: "Rule-driven notification engine: email, SMS, push and webhooks. Admin panel with delivery metrics.",
    },
    demo6_title: { es: "Plataforma de onboarding digital", en: "Digital onboarding platform" },
    demo6_desc: {
      es: "Flujo de alta de clientes con validación de identidad, firma electrónica y conexión a buró de crédito. Reduce el tiempo de onboarding de días a minutos.",
      en: "Customer sign-up flow with identity verification, electronic signature and credit bureau connection. Reduces onboarding time from days to minutes.",
    },

    /* ---- about: who we are ---- */
    wwa_eyebrow: { es: "Quiénes somos", en: "Who we are" },
    wwa_title: {
      es: "Un equipo construido para resolver los retos de software más exigentes",
      en: "A team built to solve the most demanding software challenges",
    },
    wwa_lede: {
      es: "Nacimos en México con una convicción clara: los equipos técnicos de alto nivel no deberían estar reservados solo para las grandes corporaciones.",
      en: "We were born in Mexico with a clear conviction: high-level technical teams shouldn't be reserved only for large corporations.",
    },
    wwa_story_title: { es: "Cómo empezamos", en: "How we started" },
    wwa_story_body: {
      es: "Constelutions nació de la colaboración entre ingenieros y diseñadores que compartían una visión: construir una empresa donde el rigor técnico y el cuidado por el cliente fueran inseparables. Lo que comenzó como un pequeño equipo resolviendo proyectos puntuales creció hasta convertirse en una firma de consultoría y desarrollo con presencia regional, capaz de acompañar a clientes desde la idea inicial hasta la operación en producción.",
      en: "Constelutions grew out of a collaboration between engineers and designers who shared a vision: to build a company where technical rigor and care for the client were inseparable. What started as a small team solving one-off projects grew into a consulting and development firm with regional reach, capable of supporting clients from the initial idea through to production.",
    },
    wwa_location_title: { es: "Dónde estamos", en: "Where we are" },
    wwa_location_body: {
      es: "Tenemos nuestra sede en México y operamos de forma remota con clientes en toda América Latina y Estados Unidos. Nuestro modelo de trabajo distribuido nos permite conformar el equipo correcto para cada proyecto, sin importar la zona horaria.",
      en: "We are headquartered in Mexico and work remotely with clients across Latin America and the United States. Our distributed work model lets us assemble the right team for every project, regardless of time zone.",
    },
    wwa_badge_hq: { es: "México · CDMX", en: "Mexico · CDMX" },
    wwa_badge_reach: { es: "LATAM · EE. UU.", en: "LATAM · USA" },
    wwa_photo_label: { es: "Fotografía de sede", en: "Headquarters photo" },

    /* ---- about: misión & visión ---- */
    mv_mission_eyebrow: { es: "Misión", en: "Mission" },
    mv_mission_title: {
      es: "Construir software que importa",
      en: "Build software that matters",
    },
    mv_mission_body: {
      es: "Conectar ingeniería, diseño y estrategia para entregar productos digitales robustos, escalables y alineados a los objetivos de cada cliente. Trabajamos como una extensión del equipo de nuestros clientes, con transparencia, rigor técnico y compromiso real con los resultados.",
      en: "Connect engineering, design and strategy to deliver robust, scalable digital products aligned with each client's goals. We work as an extension of our clients' teams, with transparency, technical rigor and a genuine commitment to results.",
    },
    mv_vision_eyebrow: { es: "Visión", en: "Vision" },
    mv_vision_title: {
      es: "Ser el socio técnico de referencia en LATAM",
      en: "Become the go-to technical partner in LATAM",
    },
    mv_vision_body: {
      es: "Convertirnos en el equipo al que empresas y emprendedores de América Latina acuden cuando enfrentan sus retos digitales más complejos — reconocidos por la calidad de nuestro trabajo, la solidez de nuestras relaciones y el impacto medible que generamos.",
      en: "Become the team that companies and entrepreneurs across Latin America turn to when facing their most complex digital challenges — recognized for the quality of our work, the strength of our relationships and the measurable impact we generate.",
    },

    /* ---- team ---- */
    team_eyebrow: { es: "Nuestro equipo", en: "Our team" },
    team_title: {
      es: "Las personas detrás de cada solución",
      en: "The people behind every solution",
    },
    team_lede: {
      es: "Un grupo multidisciplinario de ingenieros, diseñadores y consultores.",
      en: "A multidisciplinary group of engineers, designers and consultants.",
    },
    team_photo: { es: "Foto", en: "Photo" },
    team_name: { es: "Nombre Apellido", en: "Name Surname" },
    m1_r: { es: "Desarrollo de Software", en: "Software Development" },
    m2_r: { es: "Diseño UI/UX", en: "UI/UX Design" },
    m3_r: { es: "Arquitectura & DevOps", en: "Architecture & DevOps" },
    m4_r: { es: "Consultoría & Estrategia", en: "Consulting & Strategy" },
    team_note: {
      es: "Fotos y nombres de ejemplo — añade a tu equipo real.",
      en: "Sample photos and names — add your real team.",
    },

    /* ---- contact ---- */
    contact_eyebrow: { es: "Contacto", en: "Contact" },
    contact_title: { es: "Cuéntanos sobre tu proyecto", en: "Tell us about your project" },
    contact_lede: {
      es: "Responderemos en menos de 24 horas hábiles. Sin compromisos.",
      en: "We'll reply within 24 business hours. No strings attached.",
    },
    ci_email_k: { es: "Correo", en: "Email" },
    ci_phone_k: { es: "Teléfono", en: "Phone" },
    ci_loc_k: { es: "Ubicación", en: "Location" },
    ci_loc_v: { es: "México", en: "Mexico" },
    ci_hours_k: { es: "Horario", en: "Hours" },
    ci_hours_v: { es: "Lun–Vie · 9:00–18:00 (CST)", en: "Mon–Fri · 9:00–18:00 (CST)" },
    f_name: { es: "Nombre", en: "Name" },
    f_name_ph: { es: "Tu nombre", en: "Your name" },
    f_email: { es: "Correo", en: "Email" },
    f_email_ph: { es: "tu@empresa.com", en: "you@company.com" },
    f_company: { es: "Empresa", en: "Company" },
    f_company_ph: { es: "Nombre de tu empresa", en: "Your company name" },
    f_service: { es: "Servicio de interés", en: "Service of interest" },
    opt_default: { es: "Selecciona una opción", en: "Select an option" },
    opt_dev: { es: "Desarrollo de Software", en: "Software Development" },
    opt_design: { es: "Diseño UI/UX", en: "UI/UX Design" },
    opt_integration: { es: "Integración de APIs y Sistemas", en: "API & System Integrations" },
    opt_consulting: { es: "Consultoría", en: "Consulting" },
    opt_other: { es: "Otro", en: "Other" },
    f_message: { es: "Mensaje", en: "Message" },
    f_message_ph: { es: "Cuéntanos qué necesitas…", en: "Tell us what you need…" },
    f_submit: { es: "Enviar mensaje", en: "Send message" },
    f_success_t: {
      es: "¡Gracias! Hemos recibido tu mensaje.",
      en: "Thank you! We've received your message.",
    },
    f_success_d: { es: "Te contactaremos muy pronto.", en: "We'll be in touch very soon." },

    /* ---- CTA banner ---- */
    cta_title: {
      es: "¿Listo para construir algo extraordinario?",
      en: "Ready to build something extraordinary?",
    },
    cta_lede: {
      es: "Agenda una consulta gratuita y descubre cómo podemos ayudarte.",
      en: "Book a free consultation and discover how we can help.",
    },

    /* ---- footer ---- */
    foot_tagline: {
      es: "Constelaciones de talento para resolver tus retos de software. Desde México para el mundo.",
      en: "Constellations of talent to solve your software challenges. From Mexico to the world.",
    },
    foot_services: { es: "Servicios", en: "Services" },
    foot_company: { es: "Empresa", en: "Company" },
    foot_contact: { es: "Contacto", en: "Contact" },
    foot_rights: { es: "Todos los derechos reservados.", en: "All rights reserved." },
    foot_made: { es: "Hecho en México", en: "Made in Mexico" },
    foot_privacy: { es: "Privacidad", en: "Privacy" },
    foot_terms: { es: "Términos", en: "Terms" },

    /* ---- services page ---- */
    sp_crumb: { es: "Inicio / Servicios", en: "Home / Services" },
    sp_eyebrow: { es: "Servicios", en: "Services" },
    sp_title: {
      es: "Capacidades completas para construir, integrar y escalar.",
      en: "Full capabilities to build, integrate and scale.",
    },
    sp_lede: {
      es: "Cuatro servicios principales y ocho especialidades de consultoría, diseñados para empresas y equipos técnicos.",
      en: "Four core services and eight consulting specialties, designed for companies and technical teams.",
    },

    sd1_desc: {
      es: "Construimos aplicaciones web y móviles a la medida de tu negocio, con arquitectura sólida y código mantenible que crece contigo.",
      en: "We build web and mobile applications tailored to your business, with solid architecture and maintainable code that grows with you.",
    },
    sd1_f1_t: { es: "Aplicaciones web", en: "Web apps" },
    sd1_f1_d: {
      es: "SPA, dashboards y plataformas con React, Next.js y más.",
      en: "SPAs, dashboards and platforms with React, Next.js and more.",
    },
    sd1_f2_t: { es: "Apps móviles", en: "Mobile apps" },
    sd1_f2_d: {
      es: "iOS y Android, nativo o multiplataforma.",
      en: "iOS and Android, native or cross-platform.",
    },
    sd1_f3_t: { es: "Backend & APIs", en: "Backend & APIs" },
    sd1_f3_d: {
      es: "Servicios escalables, seguros y bien documentados.",
      en: "Scalable, secure and well-documented services.",
    },
    sd1_f4_t: { es: "Modernización", en: "Modernization" },
    sd1_f4_d: {
      es: "Migración y refactor de sistemas heredados.",
      en: "Migration and refactor of legacy systems.",
    },

    sd2_desc: {
      es: "Diseñamos experiencias digitales claras y atractivas, centradas en tus usuarios y en los objetivos de tu negocio.",
      en: "We design clear, engaging digital experiences centered on your users and your business goals.",
    },
    sd2_f1_t: { es: "Investigación UX", en: "UX research" },
    sd2_f1_d: {
      es: "Entrevistas, flujos y arquitectura de información.",
      en: "Interviews, flows and information architecture.",
    },
    sd2_f2_t: { es: "Diseño de interfaz", en: "Interface design" },
    sd2_f2_d: {
      es: "Sistemas de diseño consistentes y accesibles.",
      en: "Consistent, accessible design systems.",
    },
    sd2_f3_t: { es: "Prototipado", en: "Prototyping" },
    sd2_f3_d: {
      es: "Prototipos interactivos para validar antes de construir.",
      en: "Interactive prototypes to validate before building.",
    },
    sd2_f4_t: { es: "Pruebas de usabilidad", en: "Usability testing" },
    sd2_f4_d: {
      es: "Validación con usuarios reales e iteración.",
      en: "Validation with real users and iteration.",
    },

    sd3_desc: {
      es: "Conectamos tus herramientas, servicios y fuentes de datos para que tu operación funcione como un sistema unificado.",
      en: "We connect your tools, services and data sources so your operation runs as one unified system.",
    },
    sd3_f1_t: { es: "Integración de APIs", en: "API integration" },
    sd3_f1_d: {
      es: "REST, GraphQL y webhooks entre plataformas.",
      en: "REST, GraphQL and webhooks across platforms.",
    },
    sd3_f2_t: { es: "Sincronización de datos", en: "Data sync" },
    sd3_f2_d: {
      es: "Flujos confiables entre sistemas y bases de datos.",
      en: "Reliable flows between systems and databases.",
    },
    sd3_f3_t: { es: "Servicios externos", en: "Third-party services" },
    sd3_f3_d: {
      es: "Pagos, ERP, CRM y servicios de terceros.",
      en: "Payments, ERP, CRM and third-party services.",
    },
    sd3_f4_t: { es: "Automatización", en: "Automation" },
    sd3_f4_d: {
      es: "Procesos automatizados que ahorran tiempo.",
      en: "Automated processes that save time.",
    },

    sd4_desc: {
      es: "Ponemos a tu disposición especialistas que elevan el estándar técnico de tu equipo, por proyecto o de forma continua. Estas son nuestras ocho áreas de consultoría:",
      en: "We give you specialists who raise your team's technical standard, by project or on an ongoing basis. These are our eight consulting areas:",
    },
  };

  function get(k, lang) {
    return DICT[k] && DICT[k][lang] != null ? DICT[k][lang] : null;
  }

  function apply(lang) {
    var html = document.documentElement;
    html.setAttribute("data-lang", lang);
    html.setAttribute("lang", lang);
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var v = get(el.getAttribute("data-i18n"), lang);
      if (v != null) el.textContent = v;
    });
    document.querySelectorAll("[data-i18n-html]").forEach(function (el) {
      var v = get(el.getAttribute("data-i18n-html"), lang);
      if (v != null) el.innerHTML = v;
    });
    document.querySelectorAll("[data-i18n-attr]").forEach(function (el) {
      el.getAttribute("data-i18n-attr")
        .split(";")
        .forEach(function (pair) {
          var p = pair.split(":");
          if (p.length < 2) return;
          var v = get(p[1].trim(), lang);
          if (v != null) el.setAttribute(p[0].trim(), v);
        });
    });
    try {
      localStorage.setItem("cl_lang", lang);
    } catch (e) {}
  }

  function getLang() {
    try {
      return localStorage.getItem("cl_lang") || "es";
    } catch (e) {
      return "es";
    }
  }

  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-set-lang]");
    if (b) {
      e.preventDefault();
      apply(b.getAttribute("data-set-lang"));
    }
  });

  var initial = getLang();
  if (initial !== "es") {
    if (document.readyState === "loading")
      document.addEventListener("DOMContentLoaded", function () {
        apply(initial);
      });
    else apply(initial);
  } else {
    document.documentElement.setAttribute("data-lang", "es");
  }

  window.CLI18N = { apply: apply, getLang: getLang };
})();
