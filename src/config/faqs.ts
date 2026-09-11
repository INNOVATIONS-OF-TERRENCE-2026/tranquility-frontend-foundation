export interface Faq {
  question: string;
  answer: string;
  questionEs: string;
  answerEs: string;
}

export const faqs: Faq[] = [
  {
    question: "What determines pricing?",
    answer: "Pricing starts from the cleaning type you choose: Standard, Deep, or Move-In/Move-Out, based on a standard average 1-bedroom, 1-full-bath home. From there, only approved add-ons and additional rooms are applied. We do not price your home using a square-footage formula.",
    questionEs: "¿Qué determina el precio?",
    answerEs: "El precio comienza con el tipo de limpieza que elijas: Estándar, Profunda o Entrada/Salida, basado en una vivienda estándar promedio de 1 dormitorio y 1 baño completo. A partir de ahí, solo se agregan las habitaciones adicionales y servicios aprobados que correspondan. No calculamos el precio de tu hogar mediante una fórmula basada en pies cuadrados.",
  },
  {
    question: "Why can the final price change?",
    answer: "Square footage, layout, the condition of the home, customizations, unusual scope, or specialty work can all affect what a clean actually takes. Anything that would change your price is confirmed with you before service.",
    questionEs: "¿Por qué puede cambiar el precio final?",
    answerEs: "Los pies cuadrados, la distribución, la condición del hogar, las personalizaciones, un alcance inusual o trabajo especializado pueden cambiar lo que realmente requiere una limpieza. Cualquier cambio de precio se confirma contigo antes del servicio.",
  },
  {
    question: "What are the recurring-service savings?",
    answer: "Weekly service saves 20%, bi-weekly saves 15%, and monthly saves 10%. Savings apply to the service price only. Add-ons are charged at their listed rate.",
    questionEs: "¿Cuáles son los descuentos por servicio recurrente?",
    answerEs: "El servicio semanal ahorra 20%, el servicio cada dos semanas ahorra 15% y el servicio mensual ahorra 10%. Los descuentos se aplican solo al precio del servicio. Los servicios adicionales se cobran al precio indicado.",
  },
  {
    question: "What happens with large or custom homes?",
    answer: "Homes around 3,000 sq ft and larger are treated as custom scope and reviewed with you through a quote or virtual consultation rather than an automated estimate.",
    questionEs: "¿Qué sucede con viviendas grandes o personalizadas?",
    answerEs: "Las viviendas de aproximadamente 3,000 pies cuadrados o más se consideran un alcance personalizado y se revisan contigo mediante una cotización o consulta virtual en lugar de un estimado automatizado.",
  },
  {
    question: "Can I request only part of my home?",
    answer: "Yes. Cleaning a specific set of rooms, for example one bedroom and two bathrooms in a larger home, is custom scope. Request a quote and we'll price the actual rooms you want serviced.",
    questionEs: "¿Puedo solicitar la limpieza de solo una parte de mi hogar?",
    answerEs: "Sí. Limpiar un grupo específico de habitaciones, por ejemplo un dormitorio y dos baños dentro de una vivienda más grande, se considera un alcance personalizado. Solicita una cotización y calcularemos el precio según las áreas que realmente deseas limpiar.",
  },
  {
    question: "What about pets?",
    answer: "Pets are welcome to stay as long as they are not a distraction or hindrance to the work. Anxious, aggressive, or disruptive animals should be safely secured while we're in the home. Let us know about your pets when you request service.",
    questionEs: "¿Qué sucede con las mascotas?",
    answerEs: "Las mascotas pueden permanecer en el hogar siempre que no distraigan ni dificulten el trabajo. Los animales ansiosos, agresivos o que puedan interrumpir el servicio deben mantenerse asegurados de manera segura mientras estamos en la vivienda. Infórmanos sobre tus mascotas al solicitar el servicio.",
  },
  {
    question: "Do you provide supplies and equipment?",
    answer: "Yes. We bring the supplies and equipment needed for the service you've requested.",
    questionEs: "¿Proporcionan los productos y el equipo?",
    answerEs: "Sí. Llevamos los productos y el equipo necesarios para el servicio que has solicitado.",
  },
  {
    question: "Can I request my own or non-toxic products?",
    answer: "You can. If you'd like us to use products you provide, or prefer non-toxic options, note it in your request so we can plan for it.",
    questionEs: "¿Puedo solicitar que usen mis propios productos o productos no tóxicos?",
    answerEs: "Sí. Si deseas que usemos productos que tú proporciones o prefieres opciones no tóxicas, indícalo en tu solicitud para que podamos planificarlo.",
  },
  {
    question: "What if I'm not home?",
    answer: "You don't have to be. Share your entry instructions when we confirm your service and we'll follow them exactly.",
    questionEs: "¿Qué pasa si no estoy en casa?",
    answerEs: "No es necesario que estés presente. Comparte las instrucciones de acceso cuando confirmemos el servicio y las seguiremos cuidadosamente.",
  },
  {
    question: "How do cancellations and rescheduling work?",
    answer: "Please contact us as early as possible if you need to cancel or reschedule so we can adjust the schedule and offer the time to someone else.",
    questionEs: "¿Cómo funcionan las cancelaciones y los cambios de fecha?",
    answerEs: "Comunícate con nosotros lo antes posible si necesitas cancelar o cambiar la fecha para que podamos ajustar el horario y ofrecer ese espacio a otro cliente.",
  },
  {
    question: "What add-ons are available?",
    answer: "Additional bedrooms and bathrooms, half baths, living and dining rooms, offices, laundry rooms, laundry by the load, oven and refrigerator interiors, cabinet interiors, range hood and vents, baseboards, excess dishes, excess pet hair vacuuming, garage or patio, and carpet spot cleaning. Full pricing is shown in the service request flow.",
    questionEs: "¿Qué servicios adicionales están disponibles?",
    answerEs: "Dormitorios y baños adicionales, medios baños, salas y comedores, oficinas, lavanderías, lavado por carga, interior del horno y refrigerador, interior de gabinetes, campana y ventilas de la estufa, zócalos, exceso de platos, aspirado de exceso de pelo de mascotas, garaje o patio y limpieza puntual de alfombra. Los precios completos aparecen en el proceso de solicitud de servicio.",
  },
  {
    question: "How does a virtual consultation work?",
    answer: "You share details about your property, its size, scope and condition, plus how and when you'd like to be reached. We follow up to walk through the space with you and prepare a quote that reflects the real work involved.",
    questionEs: "¿Cómo funciona una consulta virtual?",
    answerEs: "Compartes detalles sobre tu propiedad, su tamaño, alcance y condición, además de cómo y cuándo prefieres que nos comuniquemos contigo. Después revisamos el espacio contigo y preparamos una cotización que refleje el trabajo real necesario.",
  },
  {
    question: "Do you clean offices and commercial spaces?",
    answer: "Yes. Commercial and office cleaning is always handled through a custom quote or consultation rather than residential pricing.",
    questionEs: "¿Limpian oficinas y espacios comerciales?",
    answerEs: "Sí. La limpieza comercial y de oficinas siempre se maneja mediante una cotización personalizada o una consulta, no con precios residenciales.",
  },
  {
    question: "Do you require a contract?",
    answer: "Recurring service and any terms around it are discussed with you during confirmation. Nothing is locked in from this website.",
    questionEs: "¿Requieren contrato?",
    answerEs: "El servicio recurrente y cualquier condición relacionada se revisan contigo durante la confirmación. Nada queda comprometido automáticamente desde este sitio web.",
  },
  {
    question: "Is tipping required?",
    answer: "No. Tipping is never required or expected. It is simply a courtesy some customers choose to offer.",
    questionEs: "¿Es obligatorio dar propina?",
    answerEs: "No. La propina nunca es obligatoria ni se espera. Es simplemente una cortesía que algunos clientes deciden ofrecer.",
  },
];