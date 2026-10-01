#include <Keypad.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
const byte ROW_NUM    = 4;
const byte COL_NUM    = 4;
char keys[ROW_NUM][COL_NUM] = {
  {'1','2','3','A'},
  {'4','5','6','B'},
  {'7','8','9','C'},
  {'*','0','#','D'}
};
byte pin_rows[ROW_NUM] = {9, 8, 7, 6};
byte pin_column[COL_NUM] = {5, 4, 3, 2};
Keypad keypad = Keypad(makeKeymap(keys), pin_rows, pin_column, ROW_NUM, COL_NUM);
LiquidCrystal_I2C lcd(0x27, 16, 2);
int score = 0;
String questions[] = {
  "What is Robotics?",
  "What is an Actuator?",
  "Who invented the first robot?",
  "What is AI in Robotics?"
};
String options[][4] = {
  {"1. Machines", "2. Automates", "3. Robots", "4. Computers"},
  {"1. Sensory Device", "2. Power Source", "3. Movement Device", "4. Controller"},
  {"1. Tesla", "2. Leonardo", "3. Da Vinci", "4. George C. Devol"},
  {"1. Artificial Intelligence", "2. Automated Intelligence", "3. Arithmetic Intelligence", "4. Analytical Intelligence"}
};
char answers[] = {'3', '3', '4', '1'};
void setup() {
  lcd.begin(16, 2);
  lcd.clear();
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print("Welcome to the");
  lcd.setCursor(0, 1);
  lcd.print("Robotics Quiz!");
  delay(3000);
  lcd.clear();
}
void loop() {
  for (int i = 0; i < 4; i++) {
    askQuestion(i);
    char answer = getAnswer();
    checkAnswer(answer, i);
  }
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Final Score:");
  lcd.setCursor(0, 1);
  lcd.print(score);
  delay(5000);
  score = 0;
}
void askQuestion(int index) {
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print(questions[index].substring(0, 16));
  delay(3000);
  for (int i = 0; i < 4; i++) {
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print(options[index][i].substring(0, 16));
    delay(3000);
  }
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Select 1-4");
}
char getAnswer() {
  char key = keypad.getKey();
  while (key == NO_KEY) {
    key = keypad.getKey();
  }
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("You selected:");
  lcd.setCursor(0, 1);
  lcd.print(key);
  delay(1000);
  return key;
}
void checkAnswer(char answer, int index) {
  if (answer == answers[index]) {
    score++;
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("Correct!");
  } else {
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("Incorrect!");
  }
  delay(2000);
}
