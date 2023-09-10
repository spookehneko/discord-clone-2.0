import {Member, Profile, Server} from "@prisma/client";

/**
 * ServerWithMembersWithProfiles is a Server with a list of Members with their Profiles
 */

export type ServerWithMembersWithProfiles = Server & {
    members: (Member & {
        profile: Profile
    })[]
};