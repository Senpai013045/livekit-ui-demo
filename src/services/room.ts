import { z } from "zod";
import { fetcher } from "../lib/fetcher";

const GetTokenSchema = z.object({
  "access token": z.string(),
});

//TODO - uncomment this and comment the one below to get the error
// export const getToken = async (user: string, room: string) => {
//   const response = await fetcher.post("/room", { user, room });
//   const parsed = GetTokenSchema.parse(response.data);
//   return parsed["access token"];
// };

export const getToken = async (_user: string, _room: string) => {
  //return token on search params
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");
  return token || ""
};

const UpdateHandRaiseSchema = z.object({
  message: z.string(),
});

export const updateHandRaise = async (user: string, room: string) => {
  const response = await fetcher.post("room/update-handraise", {
    roomId: room,
    userId: user,
  });
  const parsed = UpdateHandRaiseSchema.parse(response.data);
  return parsed.message;
};
