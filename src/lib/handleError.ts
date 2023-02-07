import axios from "axios";
import {z} from "zod";
import {toast} from "react-toastify";

export const parseErrorMessage = (error: unknown): string => {
  let message = "Something went wrong";

  if (error instanceof Error) {
    message = error.message;
  }

  if (axios.isAxiosError(error)) {
    message = error.message;
    if (typeof error.response?.data?.message === "string") {
      message = error.response.data.message;
    }
  }

  if (error instanceof z.ZodError) {
    const issue = error.issues[0];
    message = `'${issue.path.join(",")}' was ${issue.message.toLowerCase()}`;
  }

  return message;
};

export const notifyErrorMessage = (error: unknown) => {
  const message = parseErrorMessage(error);
  toast.error(message);
};
