import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { requireAdminOrTeacher } from "../middleware/teacher";
import { validate } from "../middleware/validate";
import {
  getStudentGroups,
  createStudentGroup, createGroupSchema,
  updateStudentGroup,
  deleteStudentGroup,
  getGroupMembers,
  addGroupMembers, addMembersSchema,
  removeGroupMember,
} from "../controllers/studentgroup.controller";

const router = Router();

router.use(authenticate);
router.use(requireAdminOrTeacher);

router.get("/", getStudentGroups);
router.post("/", validate(createGroupSchema), createStudentGroup);
router.put("/:id", validate(createGroupSchema), updateStudentGroup);
router.delete("/:id", deleteStudentGroup);
router.get("/:id/members", getGroupMembers);
router.post("/:id/members", validate(addMembersSchema), addGroupMembers);
router.delete("/:id/members/:userId", removeGroupMember);

export default router;
