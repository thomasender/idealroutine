export type Exercise = {
  id: string;
  name: string;
  oldNames: string[];
  repGoal: string;
};

export const EXERCISES: Record<string, Exercise> = {
  "ex-1": {
    id: "ex-1",
    name: "Peck Deck",
    oldNames: ["peck deck"],
    repGoal: "6 - 10",
  },
  "ex-2": {
    id: "ex-2",
    name: "Incline Press",
    oldNames: ["incline press"],
    repGoal: "1 - 3",
  },
  "ex-3": {
    id: "ex-3",
    name: "Close Grip Pull Down",
    oldNames: ["close grip pull down"],
    repGoal: "6 - 10",
  },
  "ex-4": {
    id: "ex-4",
    name: "Deadlift",
    oldNames: ["deadlift"],
    repGoal: "5 - 8",
  },
  "ex-5": {
    id: "ex-5",
    name: "Ab Crunch",
    oldNames: ["Ab crunch", "ab crunch"],
    repGoal: "5 - 8",
  },
  "ex-6": {
    id: "ex-6",
    name: "Leg Extensions",
    oldNames: ["leg extensions"],
    repGoal: "8 - 15",
  },
  "ex-7": {
    id: "ex-7",
    name: "Leg Press",
    oldNames: ["leg press"],
    repGoal: "8 - 15",
  },
  "ex-8": {
    id: "ex-8",
    name: "Calf Raises",
    oldNames: ["calf raises"],
    repGoal: "12 - 20",
  },
  "ex-9": {
    id: "ex-9",
    name: "Abductor",
    oldNames: ["Abductor"],
    repGoal: "8 - 15",
  },
  "ex-10": {
    id: "ex-10",
    name: "Adductor",
    oldNames: ["Adductor"],
    repGoal: "8 - 15",
  },
  "ex-11": {
    id: "ex-11",
    name: "Lateral Raise",
    oldNames: ["Lateral raise"],
    repGoal: "6 - 10",
  },
  "ex-12": {
    id: "ex-12",
    name: "Bend Over Raise",
    oldNames: ["bend over raise"],
    repGoal: "6 - 10",
  },
  "ex-13": {
    id: "ex-13",
    name: "Barbell Curl",
    oldNames: ["barbell curl"],
    repGoal: "6 - 10",
  },
  "ex-14": {
    id: "ex-14",
    name: "Triceps Extensions",
    oldNames: ["triceps extensions"],
    repGoal: "6 - 10",
  },
  "ex-15": { 
    id: "ex-15", 
    name: "Dips", 
    oldNames: ["dips"], 
    repGoal: "3 - 5" 
  },
  "ex-16": {
    id: "ex-16",
    name: "Leg Extensions Static Hold",
    oldNames: ["leg extensions static hold"],
    repGoal: "hold",
  },
  "ex-17": {
    id: "ex-17",
    name: "Squats",
    oldNames: ["squats"],
    repGoal: "8 - 15",
  },
}; 