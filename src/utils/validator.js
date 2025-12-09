import Validator from "fastest-validator";

const validator = new Validator();

const RegistrationFormSchema = {
  // username: {
  //   type: "string",
  //   empty: false,
  //   min: 3,
  //   messages: {
  //     stringEmpty: "Имя пользователя обязательно для заполнения",
  //     stringMin: "Имя пользователя должно содержать минимум 3 символа",
  //   },
  // },
  email: {
    type: "email",
    required: true,
    empty: false,
    messages: {
      emailEmpty: "Email обязателен для заполнения",
      email: "Введите корректный email",
    },
  },
  password: {
    type: "string",
    empty: false,
    min: 6,
    max: 20,
    pattern: /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6,}$/,
    messages: {
      stringEmpty: "Пароль обязателен для заполнения",
      stringMin: "Пароль должен содержать минимум 6 символов",
      stringPattern:
        "Пароль должен содержать хотя бы одну заглавную букву, одну цифру и один специальный символ",
    },
  },
  confirmPassword: {
    type: "equal",
    field: "password",
    messages: {
      equalField: "Пароли не совпадают",
    },
  },
};

export const validateRegistrationForm = (data) => {
  const check = validator.compile(RegistrationFormSchema);
  return check(data);
};
