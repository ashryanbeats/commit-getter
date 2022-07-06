const promiser = (promise) => {
  if (Array.isArray(promise)) promise = Promise.all(promise);
  return promise.then((data) => [data, null]).catch((error) => [null, error]);
};

const exitWithError = (errorSource, error) => {
    console.error(error);
    console.log(
      `===\nError with ${errorSource}. Received the above error.\nExiting...`
    );
    process.exit(1);
}

export { promiser, exitWithError };