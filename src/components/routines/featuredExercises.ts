import type { Equipment, MuscleGroup } from "@/types";

// Ejercicios canónicos por muscle group y equipment.
// Nombres exactos de la base de datos + traducción al español.
// Orden: del más importante al menos importante (se toman los primeros N).

export type FeaturedExercise = { name: string; name_es: string };
type ExercisesByEquipment = Record<Equipment, FeaturedExercise[]>;

const e = (name: string, name_es: string): FeaturedExercise => ({ name, name_es });

export const FEATURED_EXERCISES: Record<MuscleGroup, ExercisesByEquipment> = {
  chest: {
    full_gym: [
      e("Barbell Bench Press - Medium Grip", "Press de banca con barra agarre medio"),
      e("Incline Dumbbell Press", "Press inclinado con mancuernas"),
      e("Dumbbell Flyes", "Aperturas con mancuernas"),
      e("Decline Barbell Bench Press", "Press de banca declinada con barra"),
      e("Cable Crossover", "Cruce de cables"),
    ],
    home_weights: [
      e("Dumbbell Bench Press", "Press de banca con mancuernas"),
      e("Incline Dumbbell Press", "Press inclinado con mancuernas"),
      e("Dumbbell Flyes", "Aperturas con mancuernas"),
      e("Incline Dumbbell Flyes", "Aperturas con mancuerna en banca inclinada"),
      e("Decline Dumbbell Bench Press", "Press de banca declinada con mancuernas"),
    ],
    bodyweight: [
      e("Pushups", "Flexiones"),
      e("Decline Push-Up", "Flexiones en declive"),
      e("Incline Push-Up", "Flexión inclinada"),
      e("Push-Up Wide", "Flexión con agarre ancho"),
      e("Dips - Chest Version", "Fondos versión pecho"),
    ],
  },

  back: {
    full_gym: [
      e("Barbell Deadlift", "Peso muerto con barra"),
      e("Bent Over Barbell Row", "Remo inclinado con barra"),
      e("Wide-Grip Lat Pulldown", "Jalón al pecho agarre ancho"),
      e("Seated Cable Rows", "Remo sentado en polea"),
      e("One-Arm Dumbbell Row", "Remo con mancuerna a un brazo"),
    ],
    home_weights: [
      e("One-Arm Dumbbell Row", "Remo con mancuerna a un brazo"),
      e("Bent Over Two-Dumbbell Row", "Remo inclinado con dos mancuernas"),
      e("Dumbbell Incline Row", "Remo inclinado con mancuernas"),
      e("Two-Arm Kettlebell Row", "Remo con kettlebell a dos manos"),
      e("Inverted Row", "Remo invertido"),
    ],
    bodyweight: [
      e("Pullups", "Dominadas"),
      e("Chin-Up", "Dominadas con agarre cerrado"),
      e("Inverted Row", "Remo invertido"),
      e("Superman", "Superman"),
      e("Bodyweight Mid Row", "Remo a media altura con peso corporal"),
    ],
  },

  shoulders: {
    full_gym: [
      e("Barbell Shoulder Press", "Press de hombro con barra"),
      e("Dumbbell Shoulder Press", "Press de hombro con mancuernas"),
      e("Side Lateral Raise", "Elevación lateral"),
      e("Face Pull", "Jalón al rostro"),
      e("Barbell Rear Delt Row", "Remo de deltoides posterior con barra"),
    ],
    home_weights: [
      e("Dumbbell Shoulder Press", "Press de hombro con mancuernas"),
      e("Side Lateral Raise", "Elevación lateral"),
      e("Front Dumbbell Raise", "Elevación frontal con mancuernas"),
      e("Bent Over Dumbbell Rear Delt Raise With Head On Bench", "Elevación posterior de deltoides inclinado con cabeza sobre banco"),
      e("Arnold Dumbbell Press", "Press Arnold con mancuernas"),
    ],
    bodyweight: [
      e("Handstand Push-Ups", "Flexiones en posición de parada de manos"),
      e("Reverse Flyes", "Pájaro inverso"),
      e("Arm Circles", "Círculos con brazos"),
      e("Pike Push-Ups", "Flexiones en pica"),
      e("Scapular Pull-Up", "Dominada escapular"),
    ],
  },

  biceps: {
    full_gym: [
      e("Barbell Curl", "Curl de bíceps con barra"),
      e("Hammer Curls", "Curls martillo"),
      e("Preacher Curl", "Curl predicador"),
      e("Incline Dumbbell Curl", "Curl con mancuerna inclinado"),
      e("Cable Hammer Curls - Rope Attachment", "Curl martillo en cable con cuerda"),
    ],
    home_weights: [
      e("Dumbbell Bicep Curl", "Curl de bíceps con mancuernas"),
      e("Hammer Curls", "Curls martillo"),
      e("Concentration Curls", "Curl concentrado"),
      e("Incline Dumbbell Curl", "Curl con mancuerna inclinado"),
      e("Zottman Curl", "Curl Zottman"),
    ],
    bodyweight: [
      e("Chin-Up", "Dominadas con agarre cerrado"),
      e("Inverted Row", "Remo invertido"),
      e("Bodyweight Mid Row", "Remo a media altura con peso corporal"),
      e("Concentration Curls", "Curl concentrado"),
      e("Hammer Curls", "Curls martillo"),
    ],
  },

  triceps: {
    full_gym: [
      e("Triceps Pushdown - Rope Attachment", "Jalón de tríceps con cuerda"),
      e("Close-Grip Barbell Bench Press", "Press de banca con agarre cerrado"),
      e("EZ-Bar Skullcrusher", "Skullcrusher con barra EZ"),
      e("Dips - Triceps Version", "Fondos para tríceps"),
      e("Cable Rope Overhead Triceps Extension", "Extensión de tríceps sobre la cabeza con cuerda y cable"),
    ],
    home_weights: [
      e("Dumbbell One-Arm Triceps Extension", "Extensión de tríceps con una mancuerna"),
      e("Standing Dumbbell Triceps Extension", "Extensión de tríceps de pie con mancuerna"),
      e("Tricep Dumbbell Kickback", "Extensión de tríceps con mancuerna"),
      e("Close-Grip Dumbbell Press", "Press con mancuerna agarre cerrado"),
      e("Bench Dips", "Fondos en banco"),
    ],
    bodyweight: [
      e("Dips - Triceps Version", "Fondos para tríceps"),
      e("Bench Dips", "Fondos en banco"),
      e("Push-Ups - Close Triceps Position", "Flexiones agarre cerrado para tríceps"),
      e("Body Tricep Press", "Press de tríceps con peso corporal"),
      e("Parallel Bar Dip", "Fondos en barras paralelas"),
    ],
  },

  legs: {
    full_gym: [
      e("Barbell Squat", "Sentadilla con barra"),
      e("Leg Press", "Prensa de piernas"),
      e("Romanian Deadlift", "Peso muerto rumano"),
      e("Leg Extensions", "Extensión de piernas"),
      e("Lying Leg Curls", "Curl de pierna acostado"),
    ],
    home_weights: [
      e("Dumbbell Squat", "Sentadilla con mancuernas"),
      e("Dumbbell Lunges", "Estocadas con mancuernas"),
      e("Stiff-Legged Dumbbell Deadlift", "Peso muerto con mancuernas piernas rígidas"),
      e("Goblet Squat", "Sentadilla goblet"),
      e("Split Squat with Dumbbells", "Sentadilla búlgara con mancuernas"),
    ],
    bodyweight: [
      e("Bodyweight Squat", "Sentadilla con peso corporal"),
      e("Bodyweight Walking Lunge", "Estocada caminante con peso corporal"),
      e("Romanian Deadlift", "Peso muerto rumano"),
      e("Split Squats", "Sentadilla búlgara"),
      e("Mountain Climbers", "Escaladores"),
    ],
  },

  glutes: {
    full_gym: [
      e("Barbell Hip Thrust", "Hip thrust con barra"),
      e("Barbell Glute Bridge", "Puente de glúteos con barra"),
      e("One-Legged Cable Kickback", "Patada trasera en cable a una pierna"),
      e("Pull Through", "Jalón por entre las piernas"),
      e("Single Leg Glute Bridge", "Puente de glúteos a una pierna"),
    ],
    home_weights: [
      e("Barbell Glute Bridge", "Puente de glúteos con barra"),
      e("Single Leg Glute Bridge", "Puente de glúteos a una pierna"),
      e("Glute Kickback", "Patada de glúteo"),
      e("Kneeling Squat", "Sentadilla de rodillas"),
      e("Step-up with Knee Raise", "Step-up con elevación de rodilla"),
    ],
    bodyweight: [
      e("Butt Lift (Bridge)", "Puente"),
      e("Single Leg Glute Bridge", "Puente de glúteos a una pierna"),
      e("Glute Kickback", "Patada de glúteo"),
      e("Flutter Kicks", "Patadas de aleteo"),
      e("Step-up with Knee Raise", "Step-up con elevación de rodilla"),
    ],
  },

  core: {
    full_gym: [
      e("Plank", "Plancha"),
      e("Cable Crunch", "Crunch en cable"),
      e("Hanging Leg Raise", "Elevación de piernas colgado"),
      e("Russian Twist", "Giro ruso"),
      e("Pallof Press", "Press Pallof"),
    ],
    home_weights: [
      e("Plank", "Plancha"),
      e("Russian Twist", "Giro ruso"),
      e("Dumbbell Side Bend", "Flexión lateral con mancuerna"),
      e("Dead Bug", "Dead bug"),
      e("Kettlebell Windmill", "Molino con kettlebell"),
    ],
    bodyweight: [
      e("Plank", "Plancha"),
      e("Crunches", "Abdominales"),
      e("Hanging Leg Raise", "Elevación de piernas colgado"),
      e("Russian Twist", "Giro ruso"),
      e("Dead Bug", "Dead bug"),
    ],
  },

  calves: {
    full_gym: [
      e("Standing Calf Raises", "Elevaciones de pantorrilla de pie"),
      e("Seated Calf Raise", "Elevación de pantorrilla sentado"),
      e("Calf Press On The Leg Press Machine", "Press de pantorrillas en máquina"),
      e("Donkey Calf Raises", "Elevación de pantorrilla tipo burro"),
      e("Standing Barbell Calf Raise", "Elevación de gemelo con barra de pie"),
    ],
    home_weights: [
      e("Standing Dumbbell Calf Raise", "Elevación de talones de pie con mancuernas"),
      e("Seated Calf Raise", "Elevación de pantorrilla sentado"),
      e("Calf Raise On A Dumbbell", "Elevación de talones en mancuerna"),
      e("Standing Calf Raises", "Elevaciones de pantorrilla de pie"),
      e("Donkey Calf Raises", "Elevación de pantorrilla tipo burro"),
    ],
    bodyweight: [
      e("Standing Calf Raises", "Elevaciones de pantorrilla de pie"),
      e("Rocking Standing Calf Raise", "Elevación de talones de pie balanceado"),
      e("Standing Gastrocnemius Calf Stretch", "Estiramiento de gemelo de pie"),
      e("Seated Calf Stretch", "Estiramiento de pantorrillas sentado"),
      e("Ankle Circles", "Círculos de tobillo"),
    ],
  },

  forearms: {
    full_gym: [
      e("Farmer's Walk", "Caminata del granjero"),
      e("Palms-Up Barbell Wrist Curl Over A Bench", "Flexión de muñeca con barra sobre banco"),
      e("Palms-Down Wrist Curl Over A Bench", "Curl de muñeca con banco palmas abajo"),
      e("Wrist Roller", "Enrollador de muñeca"),
      e("Plate Pinch", "Pinza de disco"),
    ],
    home_weights: [
      e("Farmer's Walk", "Caminata del granjero"),
      e("Palms-Up Dumbbell Wrist Curl Over A Bench", "Curl de muñeca con mancuerna supinada sobre banco"),
      e("Palms-Down Dumbbell Wrist Curl Over A Bench", "Curl de muñeca con mancuerna pronada sobre banco"),
      e("Wrist Roller", "Enrollador de muñeca"),
      e("Plate Pinch", "Pinza de disco"),
    ],
    bodyweight: [
      e("Wrist Circles", "Círculos de muñeca"),
      e("Wrist Rotations with Straight Bar", "Rotaciones de muñeca con barra recta"),
      e("Kneeling Forearm Stretch", "Estiramiento de antebrazos de rodillas"),
      e("Finger Curls", "Flexión de dedos"),
      e("Plate Pinch", "Pinza de disco"),
    ],
  },
};

// Cuántos ejercicios sugerir por muscle group en un día, según cuántos músculos hay en ese día
export function exercisesPerMuscle(totalMuscles: number): number {
  if (totalMuscles <= 1) return 4;
  if (totalMuscles === 2) return 3;
  if (totalMuscles === 3) return 2;
  return 1;
}
