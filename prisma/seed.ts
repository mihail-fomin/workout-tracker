import { PrismaClient, PrimaryMuscleGroup } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const exercises = [
  // Силовые упражнения - грудь
  {
    name: "Жим штанги лёжа",
    description: "Базовое упражнение для развития грудных мышц",
    muscleGroups: ["грудь", "трицепс", "передние дельты"],
    primaryMuscleGroup: PrimaryMuscleGroup.CHEST,
  },
  {
    name: "Жим гантелей лёжа",
    description: "Упражнение для грудных мышц с гантелями",
    muscleGroups: ["грудь", "трицепс"],
    primaryMuscleGroup: PrimaryMuscleGroup.CHEST,
  },
  {
    name: "Отжимания",
    description: "Базовое упражнение с собственным весом",
    muscleGroups: ["грудь", "трицепс", "передние дельты"],
    primaryMuscleGroup: PrimaryMuscleGroup.CHEST,
  },
  {
    name: "Разведение гантелей лёжа",
    description: "Изолирующее упражнение для грудных мышц",
    muscleGroups: ["грудь"],
    primaryMuscleGroup: PrimaryMuscleGroup.CHEST,
  },
  {
    name: "Отжимания на брусьях",
    description: "Упражнение для нижней части груди и трицепса",
    muscleGroups: ["грудь", "трицепс"],
    primaryMuscleGroup: PrimaryMuscleGroup.CHEST,
  },
  {
    name: "Пуловер с гантелью",
    description: "Упражнение для грудных и широчайших",
    muscleGroups: ["грудь", "широчайшие"],
    primaryMuscleGroup: PrimaryMuscleGroup.CHEST,
  },
  {
    name: "Сведение рук в кроссовере",
    description: "Изолирующее упражнение для грудных",
    muscleGroups: ["грудь"],
    primaryMuscleGroup: PrimaryMuscleGroup.CHEST,
  },

  // Спина
  {
    name: "Становая тяга",
    description: "Базовое многосуставное упражнение",
    muscleGroups: ["спина", "ноги", "ягодицы", "предплечья"],
    primaryMuscleGroup: PrimaryMuscleGroup.BACK,
  },
  {
    name: "Подтягивания",
    description: "Базовое упражнение для широчайших мышц спины",
    muscleGroups: ["широчайшие", "бицепс", "предплечья"],
    primaryMuscleGroup: PrimaryMuscleGroup.BACK,
  },
  {
    name: "Тяга штанги в наклоне",
    description: "Упражнение для развития толщины спины",
    muscleGroups: ["широчайшие", "ромбовидные", "бицепс"],
    primaryMuscleGroup: PrimaryMuscleGroup.BACK,
  },
  {
    name: "Тяга верхнего блока",
    description: "Упражнение для широчайших мышц на тренажёре",
    muscleGroups: ["широчайшие", "бицепс"],
    primaryMuscleGroup: PrimaryMuscleGroup.BACK,
  },
  {
    name: "Тяга гантели в наклоне",
    description: "Односторонняя тяга для спины",
    muscleGroups: ["широчайшие", "ромбовидные"],
    primaryMuscleGroup: PrimaryMuscleGroup.BACK,
  },
  {
    name: "Гиперэкстензия",
    description: "Упражнение для разгибателей спины",
    muscleGroups: ["спина", "бицепс бедра"],
    primaryMuscleGroup: PrimaryMuscleGroup.BACK,
  },
  {
    name: "Тяга нижнего блока",
    description: "Горизонтальная тяга для спины",
    muscleGroups: ["широчайшие", "ромбовидные", "бицепс"],
    primaryMuscleGroup: PrimaryMuscleGroup.BACK,
  },

  // Ноги
  {
    name: "Приседания со штангой",
    description: "Король упражнений для ног",
    muscleGroups: ["квадрицепс", "ягодицы", "бицепс бедра"],
    primaryMuscleGroup: PrimaryMuscleGroup.LEGS,
  },
  {
    name: "Жим ногами",
    description: "Упражнение для ног на тренажёре",
    muscleGroups: ["квадрицепс", "ягодицы"],
    primaryMuscleGroup: PrimaryMuscleGroup.LEGS,
  },
  {
    name: "Выпады",
    description: "Упражнение для ног и ягодиц",
    muscleGroups: ["квадрицепс", "ягодицы", "бицепс бедра"],
    primaryMuscleGroup: PrimaryMuscleGroup.LEGS,
  },
  {
    name: "Разгибание ног",
    description: "Изолирующее упражнение для квадрицепса",
    muscleGroups: ["квадрицепс"],
    primaryMuscleGroup: PrimaryMuscleGroup.LEGS,
  },
  {
    name: "Сгибание ног",
    description: "Изолирующее упражнение для бицепса бедра",
    muscleGroups: ["бицепс бедра"],
    primaryMuscleGroup: PrimaryMuscleGroup.LEGS,
  },
  {
    name: "Подъём на носки",
    description: "Упражнение для икроножных мышц",
    muscleGroups: ["икры"],
    primaryMuscleGroup: PrimaryMuscleGroup.LEGS,
  },
  {
    name: "Румынская тяга",
    description: "Упражнение для бицепса бедра и ягодиц",
    muscleGroups: ["бицепс бедра", "ягодицы", "спина"],
    primaryMuscleGroup: PrimaryMuscleGroup.LEGS,
  },
  {
    name: "Гакк-приседания",
    description: "Приседания в тренажёре",
    muscleGroups: ["квадрицепс", "ягодицы"],
    primaryMuscleGroup: PrimaryMuscleGroup.LEGS,
  },

  // Плечи
  {
    name: "Армейский жим",
    description: "Базовое упражнение для дельтовидных мышц",
    muscleGroups: ["передние дельты", "средние дельты", "трицепс"],
    primaryMuscleGroup: PrimaryMuscleGroup.SHOULDERS,
  },
  {
    name: "Жим гантелей сидя",
    description: "Жим для плеч с гантелями",
    muscleGroups: ["передние дельты", "средние дельты"],
    primaryMuscleGroup: PrimaryMuscleGroup.SHOULDERS,
  },
  {
    name: "Махи гантелями в стороны",
    description: "Изолирующее упражнение для средних дельт",
    muscleGroups: ["средние дельты"],
    primaryMuscleGroup: PrimaryMuscleGroup.SHOULDERS,
  },
  {
    name: "Тяга штанги к подбородку",
    description: "Упражнение для дельт и трапеций",
    muscleGroups: ["средние дельты", "трапеции"],
    primaryMuscleGroup: PrimaryMuscleGroup.SHOULDERS,
  },
  {
    name: "Махи гантелями в наклоне",
    description: "Изолирующее упражнение для задних дельт",
    muscleGroups: ["задние дельты"],
    primaryMuscleGroup: PrimaryMuscleGroup.SHOULDERS,
  },
  {
    name: "Жим в тренажёре сидя",
    description: "Жим для плеч в тренажёре Смита",
    muscleGroups: ["передние дельты", "средние дельты"],
    primaryMuscleGroup: PrimaryMuscleGroup.SHOULDERS,
  },

  // Бицепс
  {
    name: "Подъём штанги на бицепс",
    description: "Базовое упражнение для бицепса",
    muscleGroups: ["бицепс"],
    primaryMuscleGroup: PrimaryMuscleGroup.BICEPS,
  },
  {
    name: "Подъём гантелей на бицепс",
    description: "Упражнение для бицепса с гантелями",
    muscleGroups: ["бицепс"],
    primaryMuscleGroup: PrimaryMuscleGroup.BICEPS,
  },
  {
    name: "Молотки",
    description: "Сгибание рук нейтральным хватом",
    muscleGroups: ["бицепс", "предплечья"],
    primaryMuscleGroup: PrimaryMuscleGroup.BICEPS,
  },
  {
    name: "Сгибание на скамье Скотта",
    description: "Изолирующее упражнение для бицепса",
    muscleGroups: ["бицепс"],
    primaryMuscleGroup: PrimaryMuscleGroup.BICEPS,
  },

  // Трицепс
  {
    name: "Французский жим",
    description: "Изолирующее упражнение для трицепса",
    muscleGroups: ["трицепс"],
    primaryMuscleGroup: PrimaryMuscleGroup.TRICEPS,
  },
  {
    name: "Разгибание рук на блоке",
    description: "Упражнение для трицепса на тренажёре",
    muscleGroups: ["трицепс"],
    primaryMuscleGroup: PrimaryMuscleGroup.TRICEPS,
  },
  {
    name: "Разгибание руки с гантелью из-за головы",
    description: "Изолирующее упражнение для трицепса",
    muscleGroups: ["трицепс"],
    primaryMuscleGroup: PrimaryMuscleGroup.TRICEPS,
  },
  {
    name: "Отжимания от скамьи",
    description: "Обратные отжимания для трицепса",
    muscleGroups: ["трицепс", "передние дельты"],
    primaryMuscleGroup: PrimaryMuscleGroup.TRICEPS,
  },

  // Кардио
  {
    name: "Бег",
    description: "Аэробная нагрузка на беговой дорожке или улице",
    muscleGroups: ["ноги", "сердце"],
    primaryMuscleGroup: PrimaryMuscleGroup.CARDIO,
  },
  {
    name: "Велосипед",
    description: "Кардио на велотренажёре или велосипеде",
    muscleGroups: ["ноги", "сердце"],
    primaryMuscleGroup: PrimaryMuscleGroup.CARDIO,
  },
  {
    name: "Плавание",
    description: "Полноценная аэробная нагрузка",
    muscleGroups: ["всё тело", "сердце"],
    primaryMuscleGroup: PrimaryMuscleGroup.CARDIO,
  },
  {
    name: "Эллипс",
    description: "Кардио на эллиптическом тренажёре",
    muscleGroups: ["ноги", "руки", "сердце"],
    primaryMuscleGroup: PrimaryMuscleGroup.CARDIO,
  },
  {
    name: "Гребля",
    description: "Кардио на гребном тренажёре",
    muscleGroups: ["спина", "руки", "ноги", "сердце"],
    primaryMuscleGroup: PrimaryMuscleGroup.CARDIO,
  },
  {
    name: "Скакалка",
    description: "Интенсивное кардио со скакалкой",
    muscleGroups: ["ноги", "икры", "сердце"],
    primaryMuscleGroup: PrimaryMuscleGroup.CARDIO,
  },
  {
    name: "Берпи",
    description: "Высокоинтенсивное упражнение для всего тела",
    muscleGroups: ["всё тело", "сердце"],
    primaryMuscleGroup: PrimaryMuscleGroup.CARDIO,
  },
  {
    name: "Jumping Jacks",
    description: "Прыжки с разведением рук и ног",
    muscleGroups: ["ноги", "сердце"],
    primaryMuscleGroup: PrimaryMuscleGroup.CARDIO,
  },
  {
    name: "Box Jumps",
    description: "Прыжки на тумбу",
    muscleGroups: ["ноги", "ягодицы", "сердце"],
    primaryMuscleGroup: PrimaryMuscleGroup.CARDIO,
  },
  {
    name: "Mountain Climbers",
    description: "Упражнение альпинист",
    muscleGroups: ["пресс", "ноги", "сердце"],
    primaryMuscleGroup: PrimaryMuscleGroup.CARDIO,
  },
  {
    name: "Ходьба",
    description: "Низкоинтенсивное кардио",
    muscleGroups: ["ноги", "сердце"],
    primaryMuscleGroup: PrimaryMuscleGroup.CARDIO,
  },

  // Упражнения на гибкость
  {
    name: "Планка",
    description: "Статическое упражнение для кора",
    muscleGroups: ["пресс", "спина", "плечи"],
    primaryMuscleGroup: PrimaryMuscleGroup.FLEXIBILITY,
  },
  {
    name: "Растяжка квадрицепса",
    description: "Растяжка передней поверхности бедра",
    muscleGroups: ["квадрицепс"],
    primaryMuscleGroup: PrimaryMuscleGroup.FLEXIBILITY,
  },
  {
    name: "Растяжка бицепса бедра",
    description: "Растяжка задней поверхности бедра",
    muscleGroups: ["бицепс бедра"],
    primaryMuscleGroup: PrimaryMuscleGroup.FLEXIBILITY,
  },
  {
    name: "Растяжка спины",
    description: "Упражнения для гибкости спины",
    muscleGroups: ["спина"],
    primaryMuscleGroup: PrimaryMuscleGroup.FLEXIBILITY,
  },
  {
    name: "Йога",
    description: "Комплекс упражнений для гибкости и баланса",
    muscleGroups: ["всё тело"],
    primaryMuscleGroup: PrimaryMuscleGroup.FLEXIBILITY,
  },
  {
    name: "Пилатес",
    description: "Система упражнений для укрепления мышц",
    muscleGroups: ["кор", "спина"],
    primaryMuscleGroup: PrimaryMuscleGroup.FLEXIBILITY,
  },
  {
    name: "Растяжка грудных мышц",
    description: "Растяжка для улучшения осанки",
    muscleGroups: ["грудь"],
    primaryMuscleGroup: PrimaryMuscleGroup.FLEXIBILITY,
  },
  {
    name: "Растяжка плеч",
    description: "Упражнения для гибкости плечевого пояса",
    muscleGroups: ["плечи"],
    primaryMuscleGroup: PrimaryMuscleGroup.FLEXIBILITY,
  },
  {
    name: "Скручивания на пресс",
    description: "Базовое упражнение для пресса",
    muscleGroups: ["пресс"],
    primaryMuscleGroup: PrimaryMuscleGroup.ABS_HYPEREXTENSION,
  },
  {
    name: "Подъём ног в висе",
    description: "Упражнение для нижнего пресса",
    muscleGroups: ["пресс", "сгибатели бедра"],
    primaryMuscleGroup: PrimaryMuscleGroup.ABS_HYPEREXTENSION,
  },
  {
    name: "Планка на пресс",
    description: "Статическое упражнение для кора",
    muscleGroups: ["пресс", "кор"],
    primaryMuscleGroup: PrimaryMuscleGroup.ABS_HYPEREXTENSION,
  },
  {
    name: "Гиперэкстензия для пресса",
    description: "Упражнение для разгибателей спины и ягодиц",
    muscleGroups: ["спина", "ягодицы"],
    primaryMuscleGroup: PrimaryMuscleGroup.ABS_HYPEREXTENSION,
  },
  {
    name: "Велосипед для пресса",
    description: "Скручивания с поворотом корпуса",
    muscleGroups: ["пресс", "косые мышцы"],
    primaryMuscleGroup: PrimaryMuscleGroup.ABS_HYPEREXTENSION,
  },
];

function slugify(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/ё/g, "е")
    .replace(/[^a-zа-я0-9-]/g, "");
  return slug || `ex-${name.length}-${Math.random().toString(36).slice(2, 8)}`;
}

async function main() {
  console.log("🌱 Начинаю заполнение базы данных...");

  for (const exercise of exercises) {
    const id = slugify(exercise.name);
    await prisma.exercise.upsert({
      where: { id },
      update: exercise,
      create: {
        id,
        ...exercise,
        isCustom: false,
      },
    });
  }

  console.log(`✅ Добавлено ${exercises.length} упражнений`);
}

main()
  .catch((e) => {
    console.error("❌ Ошибка при заполнении базы данных:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
