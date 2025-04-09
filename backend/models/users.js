import bcrypt from 'bcrypt';
import mongoose from 'mongoose';


const users = [
    {
        name: "John Doe ",
        email: "john@gmail.com",
        password: bcrypt.hashSync("123456", 10)
    },
    {
        name: "jane Doe ",
        email: "jane@gmail.com",
        password: bcrypt.hashSync("132456", 10)
    },
    {
        name: "jani Doe ",
        email: "jani@gmail.com",
        password: bcrypt.hashSync("132456", 10)
    }

]

export default users;