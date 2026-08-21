import { Database } from "./database.types"

type UsersEntity = Database["public"]["Tables"]["users"]["Row"]

export type Users = UsersEntity