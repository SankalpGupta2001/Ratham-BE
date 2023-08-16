import express from "express";
import mongoose from "mongoose";

import User from "./models/StudentModels.js";
import DeanSlots from "./models/deanSlotsModels.js";
import { v4 as uuidv4 } from "uuid";
import { verifyUserAuthentication } from "./middlewares/usermiddlewares.js";

const app = express();

app.use(express.json());

mongoose.connect("mongodb://127.0.0.1:27017/studentdata", {
    useUnifiedTopology: true,
    useNewUrlParser: true,
}
).then(db => console.log('DB is connected'))
    .catch(err => console.log(err));


app.get("/", (req, res) => {
    res.send("hi");
});

app.post("/api/user/login", async (req, res) => {

    const { universityId, password } = req.body;

    const userExists = await User.findOne({ universityId });

    if (!userExists) {
        let token = uuidv4();
        const user = await User.create({
            universityId,
            password,
            token
        });

        if (user) {
            res.status(201).json({
                universityId: user.universityId,
                password: user.password,
                token: token
            });
        } else {
            res.status(400)
            throw new Error('Invalid user data')
        }
    }
    else {
        if (userExists && (await userExists.matchPassword(password))) {
            const token = uuidv4();
            userExists.token = token;
            await userExists.save();
            res.json({
                universityId: userExists.universityId,
                password: userExists.password,
                token: token,
            })
        } else {
            res.status(401)
            throw new Error('Invalid studentId or password')
        }
    }



})


app.get('/api/dean/slots', verifyUserAuthentication, (req, res) => {
    const Slots = [
        { day: 'Thursday', time: '10:00 AM' },
        { day: 'Friday', time: '10:00 AM' }
    ];
    res.json({ Slots });
});




app.post("/api/dean/slotsbooking", verifyUserAuthentication, async (req, res) => {

    const { day, time, universityId } = req.body;

    const deanSlotsExists = await DeanSlots.findOne({ day, time });
    if (deanSlotsExists) {
        return res.status(400).json({ message: "Slot id being booked" });
    }

    const slot = new DeanSlots({

        day: day,
        time: time,
        universityId: universityId
    });

    const deanSlot = await slot.save();
    res.status(201).send("Slots booked successfully");
})



app.get('/api/dean/allsessions', verifyUserAuthentication, async (req, res) => {
    try {
        const cTime = new Date();
        const cDay = cTime.getDay();
        const cHour = cTime.getHours();
        const cMinute = cTime.getMinutes();


        const Sessions = await DeanSlots.find({});


        const AllSessions = Sessions.map(s => {
            const Time = new Date(s.time);
            const Day = s.day === 'Thursday' ? 4 : 5;
            const Hour = parseInt(Time.getHours());
            const Minute = parseInt(Time.getMinutes());


            if ((cDay < Day) || (cDay === Day && cHour < Hour) || (cDay === Day && cHour === Hour && cMinute < Minute)) {
                return s;
            }

        });

        res.json({ AllSessions });


    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
