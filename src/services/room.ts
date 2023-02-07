import {z} from "zod";
import {fetcher} from "../lib/fetcher";

const GetTokenSchema = z.object({
  user: z.string(),
  room: z.string(),
  token: z.string(),
});

export const getToken = async (user: string, room: string) => {
  const response = await fetcher.post("/room", {user, room});
  const parsed = GetTokenSchema.parse(response.data);
  return parsed.token;
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
