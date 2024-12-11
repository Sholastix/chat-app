// Password must contain minimum five characters. At least one of them must be letter and another one - number.
export const passwordRules = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{5,}$/;