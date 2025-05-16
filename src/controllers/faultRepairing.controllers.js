import { Repair } from "../models/repair.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

// Update Repair Process for a specific repairing item
const updateRepairProcess = asyncHandler(async (req, res, next) => {
    try {
        const { repairId, repairingIndex, repairProcessId } = req.body;
        
        // Validate inputs
        if (!repairId || !mongoose.Types.ObjectId.isValid(repairId)) {
            throw new ApiError(400, "Valid repair ID is required.");
        }
        
        if (repairingIndex === undefined || repairingIndex === null) {
            throw new ApiError(400, "Repairing item index is required.");
        }
        
        if (!repairProcessId || !mongoose.Types.ObjectId.isValid(repairProcessId)) {
            throw new ApiError(400, "Valid repair process ID is required.");
        }

        // Find the repair order
        const repair = await Repair.findById(repairId);
        if (!repair) {
            throw new ApiError(404, "Repair order not found.");
        }

        // Check if the repairing index exists
        if (repairingIndex < 0 || repairingIndex >= repair.repairing.length) {
            throw new ApiError(400, "Invalid repairing item index.");
        }

        // Find the repair process
        const repairProcess = await RepairProcess.findById(repairProcessId);
        if (!repairProcess) {
            throw new ApiError(404, "Repair process not found.");
        }

        // Update only the specific repairing item
        repair.repairing[repairingIndex].repairProcess = repairProcessId;
        
        // Optionally update status to "in_progress" if not already
        if (repair.repairing[repairingIndex].repairStatus === "booked") {
            repair.repairing[repairingIndex].repairStatus = "in_progress";
        }

        // Save the updated repair
        await repair.save();

        res.status(200).json(
            new ApiResponse(
                200, 
                { 
                    repair: repair,
                    updatedItem: repair.repairing[repairingIndex] 
                }, 
                "Repair process updated successfully."
            )
        );

    } catch (error) {
        next(error);
    }
});

export {
    updateRepairProcess,
}