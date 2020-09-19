const validateProperties = (reqBody, reqProps) => {
  // Get the keys array from the reqBody object
  const keys = Object.keys(reqBody);

  // Create the error object; if keys missing, add missing prop with missing keys
  const missingAndInvalidProps = reqProps.reduce((acc, key) => {
    if (!keys.includes(key)) {
      if (!acc.missing) {
        acc.missingReqProps = [];
      }
      acc.missingReqProps.push(key);
    }
    return acc;
  }, {});

  // Check if reqBody prop values are falsey or
  // if the 'rating' prop is a number between 0 and 5;
  // if so, add them to 'invalidProps' prop
  for (const [key, value] of Object.entries(reqBody)) {
    if (
      (!value) ||
      (key === "rating" && typeof value !== "number") ||
      (key === "rating" && (value < 0 || value > 5))
    ) {
      if (!missingAndInvalidProps.invalidProps) {
        missingAndInvalidProps.invalidProps = [];
      }
      missingAndInvalidProps.invalidProps.push(key);
    }
  }
  return missingAndInvalidProps;
};

module.exports = {
  validateProperties,
};
