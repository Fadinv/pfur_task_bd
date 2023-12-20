export const enum RegistryErrorsCodes {
	invalidEmail = 1, // Невалидный email
	userHasAlreadyExist = 2, // Пользователь уже создан
	invalidPassword = 11, // Невалидный пароль (меньше 8-ми символов)
}

export const enum LoginErrorsCodes {
	invalidEmail = 1, // Невалидный email
	invalidInputData = 11, // Невалидные данные (не известно какие)
}