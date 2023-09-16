import { NextApiResponse } from "next";
import { Server as NetServer, Socket } from "net";
import { Server as SocketIOServer } from "socket.io";
import { Member, Profile, Server } from "@prisma/client";

/**
 * ServerWithMembersWithProfiles is a Server with a list of Members with their Profiles
 */

export type ServerWithMembersWithProfiles = Server & {
  members: (Member & {
    profile: Profile;
  })[];
};

export type NextApiResponseServerIo = NextApiResponse & {
  socket: Socket & {
    server: NetServer & {
      io: SocketIOServer;
    };
  };
};
