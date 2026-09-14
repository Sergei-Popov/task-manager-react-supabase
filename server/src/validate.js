import Validator from "fastest-validator";

const validator = new Validator({ useNewCustomCheckerFunction: true });

// Возвращает Express-middleware, который проверяет req.body по схеме
// и кладёт нормализованное значение в req.body.
export function validateBody(schema) {
  const check = validator.compile({ $$strict: "remove", ...schema });
  return (req, res, next) => {
    const body = req.body ?? {};
    const result = check(body);
    if (result !== true) {
      return res.status(400).json({
        error: result[0]?.message || "Некорректные данные",
        details: result,
      });
    }
    req.body = body;
    next();
  };
}

export const uuidParam = (name = "id") => {
  const re = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return (req, res, next) => {
    if (!re.test(req.params[name] || "")) {
      return res.status(404).json({ error: "Не найдено" });
    }
    next();
  };
};
