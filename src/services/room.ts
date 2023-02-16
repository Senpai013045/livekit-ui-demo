import { z } from "zod";
import { fetcher } from "../lib/fetcher";

const GetTokenSchema = z.object({
  "access token": z.string(),
});

export const getToken = async (user: string, room: string) => {
  const response = await fetcher.post("/room", { user, room });
  const parsed = GetTokenSchema.parse(response.data);
  return parsed["access token"];
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

const UpdatePermissionSchema = z.object({
  message: z.string(),
})

export const updatePermission = async (arg: {
  roomId: string,
  premissionFor: string,
  publish: boolean,
  supervisorToken: string
}) => {
  const response = await fetcher.post("room/update-permission", arg);
  const parsed = UpdatePermissionSchema.parse(response.data);
  return parsed.message;
}