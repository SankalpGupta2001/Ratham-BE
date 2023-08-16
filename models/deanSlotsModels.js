import mongoose  from "mongoose";
const deanSlotsSchema =mongoose.Schema(
    {
        day: {
            type: String,
            required: true,
            
        },
        time: {
            type: String,
            required: true,
        },
        universityId:{
            type: String,
            required: true,

        }
    },
    {
        timestamps: true,
    }


)

const DeanSlots=mongoose.model("DeanSlots",deanSlotsSchema);
export default DeanSlots;