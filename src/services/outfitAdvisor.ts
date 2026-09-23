import { ActivityType, GarmentRecommendation, OutfitRecommendation } from '../types';

export function calculateOutfit(
  activity: ActivityType,
  temperature: number,
  isRaining: boolean,
  windSpeed: number = 10,
  isAllergyMode: boolean = false
): OutfitRecommendation {
  const isRunning = activity === 'running';
  // Thermal delta: Running increases internal heat generation; perceived effort feels roughly +10°C higher.
  const perceivedEffortTemp = isRunning ? temperature + 10 : temperature;

  const garments: GarmentRecommendation[] = [];
  const healthTips: string[] = [];
  let summaryRule = '';
  let overallAdvice = '';

  if (!isRunning) {
    // 🚶‍♀️ ANDAR / PASEAR
    if (temperature < 12 || isRaining) {
      summaryRule = isRaining && temperature >= 12
        ? 'Lluvia detectada: Cortavientos impermeable y calzado cómodo.'
        : '< 12°C o Lluvia: Chaqueta abrigada o cortavientos impermeable y calzado cómodo.';

      overallAdvice = isRaining
        ? 'Día húmedo o lluvioso en Madrid. Prioriza prendas de exterior impermeables con costuras selladas y suela antideslizante para adoquines o tierra mojada.'
        : 'Ambiente fresco para caminar. Al caminar la frecuencia cardíaca es moderada, por lo que el cuerpo no genera tanto calor metabólico: abrígate con capas para no enfriarte.';

      garments.push({
        id: 'coat',
        category: 'torso',
        categoryLabel: 'Torso y Abrigo',
        name: isRaining ? 'Cortavientos Impermeable (Waterproof)' : 'Chaqueta Abrigada / Plumífero Ligero',
        description: isRaining
          ? 'Membrana impermeable y capucha ajustable para protegerte de la lluvia madrileña.'
          : 'Aislamiento térmico medio o forro polar para retener el calor corporal.',
        iconName: 'ShieldAlert',
        isCrucial: true,
      });

      garments.push({
        id: 'pants-walking-cold',
        category: 'legs',
        categoryLabel: 'Pantalones',
        name: 'Pantalón deportivo o casual elástico',
        description: 'Tejido cortavientos o algodón perchado con libertad de paso.',
        iconName: 'Layers',
        isCrucial: false,
      });

      garments.push({
        id: 'shoes-walking-cold',
        category: 'feet',
        categoryLabel: 'Calzado',
        name: isRaining ? 'Calzado cómodo impermeable / Gore-Tex' : 'Calzado cómodo con amortiguación',
        description: isRaining
          ? 'Suela con agarre para hojas mojadas y asfalto húmedo.'
          : 'Sneakers ergonómicas para evitar fatiga en talones.',
        iconName: 'Footprints',
        isCrucial: true,
      });

      garments.push({
        id: 'acc-cold',
        category: 'accessories',
        categoryLabel: 'Accesorios',
        name: isRaining ? 'Paraguas compacto o gorro impermeable' : 'Braga para cuello o bufanda fina',
        description: 'Protege las vías respiratorias superiores si sopla viento frío de la sierra.',
        iconName: 'Umbrella',
        isCrucial: false,
      });

      healthTips.push('Al andar a paso ligero mantienes un gasto de ~250-350 kcal/h; no dejes las manos al descubierto si el viento supera los 20 km/h.');
      healthTips.push('En parques como El Retiro o Casa de Campo los caminos de tierra pueden encharcarse con lluvia.');

    } else if (temperature >= 12 && temperature <= 20) {
      summaryRule = '12°C - 20°C: Sudadera ligera o chaqueta fina.';
      overallAdvice = 'Temperatura ideal y templada para pasear por Madrid. Una segunda capa ligera que puedas quitarte o abrirte al sol es la combinación perfecta.';

      garments.push({
        id: 'hoodie',
        category: 'torso',
        categoryLabel: 'Torso',
        name: 'Sudadera ligera o Chaqueta fina',
        description: 'Prenda versátil fácil de desabrochar si la insolación sube a mediodía.',
        iconName: 'Shirt',
        isCrucial: true,
      });

      garments.push({
        id: 'tshirt-base',
        category: 'torso',
        categoryLabel: 'Primera Capa',
        name: 'Camiseta de algodón transpirable',
        description: 'Capa base confortable en contacto directo con la piel.',
        iconName: 'Sparkles',
        isCrucial: false,
      });

      garments.push({
        id: 'pants-mild',
        category: 'legs',
        categoryLabel: 'Piernas',
        name: 'Pantalón chino elástico o jogger deportivo',
        description: 'Comodidad total para distancias de paseo de 5 a 10 km.',
        iconName: 'Layers',
        isCrucial: false,
      });

      garments.push({
        id: 'shoes-mild',
        category: 'feet',
        categoryLabel: 'Calzado',
        name: 'Zapatillas de paseo / Walking shoes',
        description: 'Drop medio con buena absorción en terrenos de tierra compactada.',
        iconName: 'Footprints',
        isCrucial: true,
      });

      healthTips.push('Aprovecha las horas centrales si buscas vitamina D o las sombras de plátanos de sombra en El Retiro si buscas frescor.');

    } else {
      // > 20°C
      summaryRule = '> 20°C: Ropa fresca, gorra y protección solar.';
      overallAdvice = 'Clima cálido. Evita tejidos sintéticos pesados o prendas oscuras que absorban radiación solar. Hidrátate con regularidad en fuentes municipales.';

      garments.push({
        id: 'fresh-shirt',
        category: 'torso',
        categoryLabel: 'Torso',
        name: 'Ropa fresca (Camiseta manga corta / Lino o algodón fino)',
        description: 'Color claro para reflejar la radiación térmica directa.',
        iconName: 'Sun',
        isCrucial: true,
      });

      garments.push({
        id: 'shorts-walking',
        category: 'legs',
        categoryLabel: 'Piernas',
        name: 'Bermuda ligera o pantalón corto transpirable',
        description: 'Favorece la ventilación natural de las piernas.',
        iconName: 'Layers',
        isCrucial: false,
      });

      garments.push({
        id: 'cap-sun',
        category: 'accessories',
        categoryLabel: 'Protección Solar',
        name: 'Gorra deportiva y Gafas con filtro UV400',
        description: 'Imprescindible para proteger rostro, cuello y ojos del sol madrileño.',
        iconName: 'Glasses',
        isCrucial: true,
      });

      garments.push({
        id: 'sunscreen',
        category: 'accessories',
        categoryLabel: 'Cuidado Dérmico',
        name: 'Protector solar SPF 30+ o 50+',
        description: 'Aplica 15 minutos antes de iniciar tu caminata.',
        iconName: 'Shield',
        isCrucial: true,
      });

      healthTips.push('Bebe pequeños sorbos de agua cada 20 minutos; en Madrid hay más de 2.000 fuentes de agua potable en parques públicos.');
    }

  } else {
    // 🏃‍♂️ CORRER (RUNNING)
    // Sube ~10°C la sensación térmica por esfuerzo muscular
    if (temperature < 10) {
      if (isRaining) {
        summaryRule = '< 10°C + Lluvia: Cortavientos impermeable y transpirable.';
        overallAdvice = 'Condición fría y húmeda para correr. La clave técnica es no empaparse por fuera con la lluvia ni por dentro con tu propio sudor: membrana técnica con aberturas de ventilación.';

        garments.push({
          id: 'running-jacket-waterproof',
          category: 'torso',
          categoryLabel: 'Capa Exterior',
          name: 'Cortavientos impermeable y transpirable (Membrana 10K/10K)',
          description: 'Cremalleras termoselladas, capucha con ceñidor y ventilación axilar.',
          iconName: 'ShieldAlert',
          isCrucial: true,
        });

        garments.push({
          id: 'long-sleeve-tech',
          category: 'torso',
          categoryLabel: 'Capa Base',
          name: 'Camiseta técnica de manga larga (fibra hidrófuga)',
          description: 'Evacua el sudor rápidamente hacia la capa exterior sin retener humedad.',
          iconName: 'Shirt',
          isCrucial: true,
        });

        garments.push({
          id: 'tights-rain',
          category: 'legs',
          categoryLabel: 'Piernas',
          name: 'Mallas largas de compresión con tratamiento DWR',
          description: 'Repelen salpicaduras de agua y mantienen caliente la musculatura isquiotibial.',
          iconName: 'Layers',
          isCrucial: true,
        });

        garments.push({
          id: 'running-shoes-wet',
          category: 'feet',
          categoryLabel: 'Calzado',
          name: 'Zapatillas de running con suela de tracción húmeda',
          description: 'Goma adherente (Vibram / Continental) para evitar resbalones en asfalto mojado o adoquines.',
          iconName: 'Footprints',
          isCrucial: true,
        });

        garments.push({
          id: 'cap-rain-running',
          category: 'accessories',
          categoryLabel: 'Accesorios',
          name: 'Visera / Gorra técnica impermeable',
          description: 'Mantiene las gotas de lluvia fuera de los ojos para conservar la visibilidad.',
          iconName: 'Sparkles',
          isCrucial: false,
        });

      } else {
        summaryRule = '< 10°C: Mallas largas, camiseta técnica manga larga y cortavientos ligero.';
        overallAdvice = 'Frío matutino o invernal. Al empezar tendrás frío los primeros 10 minutos, pero a partir del km 2 tu cuerpo regulará a ~20°C equivalentes. No te sobreabrigues.';

        garments.push({
          id: 'windbreaker-light',
          category: 'torso',
          categoryLabel: 'Capa Exterior',
          name: 'Cortavientos ultraligero plegable',
          description: 'Bloquea el aire frío en bajadas o zonas abiertas; puedes atarlo a la cintura si entras en calor.',
          iconName: 'Wind',
          isCrucial: true,
        });

        garments.push({
          id: 'running-long-sleeve',
          category: 'torso',
          categoryLabel: 'Torso',
          name: 'Camiseta técnica manga larga térmica transpirable',
          description: 'Tejido gofrado o micro-polar fino que expulsa el sudor.',
          iconName: 'Shirt',
          isCrucial: true,
        });

        garments.push({
          id: 'long-tights',
          category: 'legs',
          categoryLabel: 'Piernas',
          name: 'Mallas largas de running',
          description: 'Protege tendones y rodillas del frío seco de Madrid.',
          iconName: 'Layers',
          isCrucial: true,
        });

        garments.push({
          id: 'running-shoes-road',
          category: 'feet',
          categoryLabel: 'Calzado',
          name: 'Zapatillas de running con amortiguación media/alta',
          description: 'Calcetines técnicos sintéticos (evita 100% algodón que produce ampollas con el frío).',
          iconName: 'Footprints',
          isCrucial: true,
        });

        garments.push({
          id: 'gloves-light',
          category: 'accessories',
          categoryLabel: 'Accesorios',
          name: 'Guantes finos de running y braga tubular',
          description: 'Las extremidades son las primeras en enfriarse por vasoconstricción periférica.',
          iconName: 'Sparkles',
          isCrucial: false,
        });
      }

      healthTips.push('Haz un calentamiento articular activo de 5 minutos antes de salir a la intemperie para prevenir lesiones musculares por frío.');

    } else if (temperature >= 10 && temperature <= 18) {
      summaryRule = '10°C - 18°C: Camiseta técnica manga corta y pantalón corto.';
      overallAdvice = '¡La "Ventana de Oro" del corredor! Con el esfuerzo físico tu sensación térmica rondará los 20°C - 28°C, que es el rango más eficiente para rendimiento aeróbico.';

      garments.push({
        id: 'short-sleeve-tech',
        category: 'torso',
        categoryLabel: 'Torso',
        name: 'Camiseta técnica manga corta transpirable',
        description: 'Microfibra de secado ultra-rápido con costuras planas para evitar rozaduras.',
        iconName: 'Shirt',
        isCrucial: true,
      });

      garments.push({
        id: 'running-shorts',
        category: 'legs',
        categoryLabel: 'Piernas',
        name: 'Pantalón corto de running (Shorts 5" o 7")',
        description: 'Con braguero interior transpirable y bolsillo para llaves/móvil.',
        iconName: 'Layers',
        isCrucial: true,
      });

      garments.push({
        id: 'running-shoes-tempo',
        category: 'feet',
        categoryLabel: 'Calzado',
        name: 'Zapatillas de entrenamiento diario o mixtas',
        description: 'Buen retorno de energía tanto en asfalto como en senderos de tierra compactada.',
        iconName: 'Footprints',
        isCrucial: true,
      });

      garments.push({
        id: 'running-socks',
        category: 'feet',
        categoryLabel: 'Calcetines',
        name: 'Calcetines técnicos anti-rozaduras',
        description: 'Altura tobillera o media con refuerzo en metatarso y talón de Aquiles.',
        iconName: 'Footprints',
        isCrucial: false,
      });

      if (windSpeed > 20) {
        garments.push({
          id: 'optional-gilet',
          category: 'torso',
          categoryLabel: 'Extra Viento',
          name: 'Chaleco cortavientos ligero opcional',
          description: 'Mantiene el pecho caliente protegiendo bronquios en rachas de viento.',
          iconName: 'Wind',
          isCrucial: false,
        });
      }

      healthTips.push('Con esta temperatura la tasa de sudoración es controlada, pero bebe 150-250 ml de agua cada 5 km.');

    } else {
      // > 18°C
      summaryRule = '> 18°C: Camiseta técnica ligera/tirantes y visera.';
      overallAdvice = 'Temperatura cálida a calurosa. Tu sensación térmica superará los 28°C - 35°C con el esfuerzo. Máxima prioridad en disipación de calor, ventilación y protección contra el sol.';

      garments.push({
        id: 'singlet',
        category: 'torso',
        categoryLabel: 'Torso',
        name: 'Camiseta técnica ligera o de tirantes (Singlet)',
        description: 'Malla perforada o tejido ultraligero (< 70g) que maximice la evaporación del sudor.',
        iconName: 'Sun',
        isCrucial: true,
      });

      garments.push({
        id: 'racing-shorts',
        category: 'legs',
        categoryLabel: 'Piernas',
        name: 'Pantalón corto ultraligero / Split shorts',
        description: 'Abertura lateral para total zancada y nula retención de calor.',
        iconName: 'Layers',
        isCrucial: true,
      });

      garments.push({
        id: 'visor-running',
        category: 'accessories',
        categoryLabel: 'Cabeza & Ojos',
        name: 'Visera técnica transpirable y Gafas deportivas UV',
        description: 'La visera deja abierta la coronilla permitiendo que el calor escape de la cabeza, a la vez que frena el sudor de la frente.',
        iconName: 'Sparkles',
        isCrucial: true,
      });

      garments.push({
        id: 'hydration-flask',
        category: 'accessories',
        categoryLabel: 'Hidratación',
        name: 'Soft Flask (Bidón blando de 250ml o 500ml) con electrolitos',
        description: 'En Madrid el ambiente seco acelera la pérdida de sales minerales como sodio y potasio.',
        iconName: 'Activity',
        isCrucial: true,
      });

      garments.push({
        id: 'breathable-shoes',
        category: 'feet',
        categoryLabel: 'Calzado',
        name: 'Zapatillas con upper de malla abierta muy ventilada',
        description: 'Facilita la expulsión de aire caliente del interior de la zapatilla evitando recalentamiento.',
        iconName: 'Footprints',
        isCrucial: true,
      });

      healthTips.push('Evita rodajes a ritmos máximos entre las 12:00 y las 19:00 en días soleados de primavera/verano.');
      healthTips.push('La Casa de Campo y El Retiro ofrecen sombras continuas que bajan hasta 3°C la temperatura ambiente respecto a calles de asfalto.');
    }
  }

  // Allergy Mode Adjustments
  if (isAllergyMode) {
    garments.push({
      id: 'allergy-wrap-glasses',
      category: 'accessories',
      categoryLabel: 'Protección Polen',
      name: 'Gafas deportivas envolventes con protección lateral',
      description: 'Bloquean el impacto directo de granos de polen sobre la conjuntiva ocular reduciendo lagrimeo y picor.',
      iconName: 'Glasses',
      isCrucial: true,
    });

    garments.push({
      id: 'allergy-cap',
      category: 'accessories',
      categoryLabel: 'Protección Polen',
      name: 'Gorra técnica con visera (cobertura capilar)',
      description: 'Evita que los granos de polen queden atrapados en el pelo durante el entrenamiento.',
      iconName: 'Sparkles',
      isCrucial: true,
    });

    healthTips.push('🌸 Modo Alergia: Dúchate y lávate el pelo inmediatamente al regresar a casa para no inhalar el polen depositado.');
    healthTips.push('🌸 Realiza lavados nasales con solución salina isotónica para despejar partículas antes y después del ejercicio.');
    healthTips.push('🌸 Evita las horas de máxima emisión polínica (19:00 a 22:00 h cuando el aire se enfría y desciende).');
  }

  return {
    activity,
    temperature,
    perceivedEffortTemp,
    isRaining,
    isAllergyMode,
    summaryRule,
    overallAdvice,
    garments,
    healthTips,
  };
}
