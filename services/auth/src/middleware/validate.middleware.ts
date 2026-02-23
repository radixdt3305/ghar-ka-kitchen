import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/api-error.util.js";

type ValidatorFn = (body: unknown) => string[];

export function validate(validatorFn: ValidatorFn) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const errors = validatorFn(req.body);
    if (errors.length > 0) {
      throw new AppError(errors.join("; "), 400);
    }
    next();
  };
}
