export const errorHandler = (statsuCode, message) => {
  const error = new Error();
  error.statusCode = statsuCode;
  error.message = message;

  return error;
};
