export type TestimonialBlock =
  | {
      type: "paragraphs";
      paragraphs: string[];
    }
  | {
      type: "list";
      items: string[];
    };

export type Testimonial = {
  slug: string;
  name: string;
  role: string;
  hook: string;
  blocks: TestimonialBlock[];
};

export const testimonials: Testimonial[] = [
  {
    slug: "federico-arteta",
    name: "Federico Arteta",
    role: "Presentador y participante de los coloquios",
    hook: "He sido testigo del crecimiento de un espacio de humanismo necesario en Barquisimeto.",
    blocks: [
      {
        type: "paragraphs",
        paragraphs: [
          "He sido testigo del crecimiento de un espacio de humanismo necesario en la dinámica de Barquisimeto, una ciudad de brazos tan abiertos como su geografía, que sirve de nudo vital para todo el país. En este rincón, como sucede en los grandes círculos intelectuales, todos hemos aprendido mucho más de lo que hemos enseñado.",
          "En este intercambio constante de saberes, me correspondió el honor de participar en diálogos que trascienden el tiempo y el espacio:",
        ],
      },
      {
        type: "list",
        items: [
          "El médico (Noah Gordon): navegamos por el siglo XI hasta la lejana Ispahán, en la Ruta de la Seda, explorando los orígenes de nuestra vocación.",
          "La peste (Albert Camus): junto al Dr. Vicente Guerrero —físico y médico argentino radicado por años en nuestra «Ciudad Crepuscular»—, abordamos esta obra desde ángulos históricos, médicos, psicológicos y ético-filosóficos, encontrando ecos de nuestra propia realidad pandémica.",
          "El nombre de la rosa (Umberto Eco): en un extenso diálogo con el historiador y amigo, el profesor Carlos Giménez Lizarzardo, recreamos la atmósfera del monasterio medieval italiano. Fue la ocasión perfecta para recordar con nostalgia la visita del propio Eco a Barquisimeto.",
        ],
      },
      {
        type: "paragraphs",
        paragraphs: [
          "Guardo un profundo agradecimiento hacia Liana por brindarme la oportunidad de presentar mi obra «Hospital Vargas de Caracas: Historia Social de un Hospital Latinoamericano». Este gesto reafirma el compromiso del Club Café Lectura Barquisimeto con la preservación de la memoria institucional y social de nuestra medicina.",
          "Confieso que este ha sido, ante todo, un refugio cultural para disfrutar de las grandes obras, pero también para cultivar la erudición y los afectos.",
          "Mi gratitud eterna a Liana Arrieta de Bustillos y a su perseverante equipo por mantener encendida la llama del pensamiento en Barquisimeto.",
        ],
      },
    ],
  },
  {
    slug: "douglas-jimenez",
    name: "Douglas Jiménez",
    role: "Moderador y participante de los coloquios",
    hook: "Si algún día se compila la historia cultural de Barquisimeto, Café Lectura Barquisimeto deberá ocupar un capítulo muy especial.",
    blocks: [
      {
        type: "paragraphs",
        paragraphs: [
          "Si a alguien se le ocurriera alguna vez compilar la historia cultural de Barquisimeto en los tiempos que corren, con toda seguridad el club Café Lectura Barquisimeto debería ocupar un capítulo aparte, muy especial y algo extenso. Liana Arrieta de Bustillo, promotora y cabeza más visible de esta particular iniciativa, ha contado cómo se produjo la metamorfosis de una idea de su hijo (en el año 2019) para resaltar el valor que entre los venezolanos tiene el café como vehículo gregario para todo tipo de conversaciones; en este caso, para hablar de libros, no de manera general, sino de títulos específicos, lo que, por derecho propio, le gana el título de club de lectura.",
          "He tenido el honor de moderar sesiones de obras de matemática y ciencia: Maniac (Benjamín Labatut) y El elegido de los dioses (Leopold Infeld), para demostrar que estas son disciplinas humanísticas y no simples herramientas técnicas. También, de un manual novelado de la historia de la filosofía que el noruego Gaarder nos regaló al principio de este siglo: El mundo de Sofía (Jostein Gaarder).",
        ],
      },
      {
        type: "paragraphs",
        paragraphs: [
          "Estoy seguro de que gané mucho más de lo que aporté en esas lecturas: el CCLB es una audiencia muy selecta por su inteligencia. Si algún mérito pudiera reclamar para mí, sería el de inducirlos a leer temas relacionados con la matemática que, a pesar de ser una clave cultural de nuestro tiempo, ha recibido el desprecio de ser considerada un mero instrumento técnico, por lo cual las personas formadas en eso que llamamos «humanidades» no ven con buenos ojos la inversión de su tiempo en la comprensión de sus claves. Claves que, además, son profundamente humanísticas; en ese sentido, les dimos la espalda a los griegos.",
          "Y, por supuesto, también he sido parte del público y he disfrutado de las excelentes exposiciones de obras de todo tipo: clásicas y modernas, así como de autores originales que han presentado sus propias obras. Destaco, en este rubro, la tenacidad de Liana, que nos permitió el infinito placer de conversar con la escritora española Irene Vallejo, autora del que puede ser el libro más importante del siglo XXI: «El infinito en un junco».",
          "Queda historia por delante para el Club Café Lectura Barquisimeto. ¿Quién podría dudarlo?",
        ],
      },
    ],
  },
];

export function getTestimonialBySlug(slug: string) {
  return testimonials.find((testimonial) => testimonial.slug === slug);
}
