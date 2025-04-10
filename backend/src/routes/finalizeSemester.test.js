import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import router from './finalizeSemester';
import db from '../config/db';
import OrganizationMember from '../models/OrganizationMember';
import Semester from '../models/Semester';
import EventInstance from '../models/EventInstance';
import UseAccountStatus from '../services/useAccountStatus';
import OrganizationSetting from '../models/OrganizationSetting';

vi.mock('../config/db');
vi.mock('../models/OrganizationMember');
vi.mock('../models/Semester');
vi.mock('../models/EventInstance');
vi.mock('../services/useAccountStatus');
vi.mock('../models/OrganizationSetting');

const app = express();
app.use(express.json());
app.use('/finalizeSemester', router);

describe('POST /finalizeSemester', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return 400 if orgID or selectedSemester is missing', async () => {
        const response = await request(app).post('/finalizeSemester').send({});
        expect(response.status).toBe(400);
        expect(response.body).toEqual({ error: 'Missing orgID or selectedSemester' });
    });

    // it('should finalize the semester successfully', async () => {
    //     const mockOrgID = '2';
    //     const mockSemester = { TermCode: '2245', SemesterID: '4' };

    //     db.getConnection.mockResolvedValue({
    //         beginTransaction: vi.fn(),
    //         commit: vi.fn(),
    //         rollback: vi.fn(),
    //     });

    //     EventInstance.updateEventOccurrences.mockResolvedValue();
    //     OrganizationMember.getAllMembersByOrgAndSemester.mockResolvedValue([
    //         { MemberID: 'mem1', Status: 'Active', GraduationSemester: '2023F', RoleID: 'role1' },
    //     ]);
    //     Semester.getNextSemester.mockResolvedValue('sem124');
    //     UseAccountStatus.updateMemberStatus.mockResolvedValue('Alumni');
    //     OrganizationMember.insertOrganizationMemberWithRoleStatus.mockResolvedValue();
    //     OrganizationMember.removeRecordsAfterSemester.mockResolvedValue();
    //     OrganizationSetting.finalizeSemester.mockResolvedValue();

    //     const response = await request(app)
    //         .post('/finalizeSemester')
    //         .send({ orgID: mockOrgID, selectedSemester: mockSemester });

    //     expect(response.status).toBe(200);
    //     expect(response.body).toEqual({ success: true });
    //     expect(EventInstance.updateEventOccurrences).toHaveBeenCalledWith(mockOrgID, '2023F', 'sem123');
    //     expect(OrganizationMember.getAllMembersByOrgAndSemester).toHaveBeenCalledWith(mockOrgID, 'sem123');
    //     expect(OrganizationSetting.finalizeSemester).toHaveBeenCalledWith(mockOrgID, 'sem123', expect.any(Object));
    // });

    // it('should return 500 if an error occurs during finalization', async () => {
    //     const mockOrgID = 'org123';
    //     const mockSemester = { TermCode: '2023F', SemesterID: 'sem123' };

    //     db.getConnection.mockResolvedValue({
    //         beginTransaction: vi.fn(),
    //         commit: vi.fn(),
    //         rollback: vi.fn(),
    //     });

    //     EventInstance.updateEventOccurrences.mockRejectedValue(new Error('Database error'));

    //     const response = await request(app)
    //         .post('/finalizeSemester')
    //         .send({ orgID: mockOrgID, selectedSemester: mockSemester });

    //     expect(response.status).toBe(500);
    //     expect(response.body).toEqual({ error: 'Failed to finalize semester' });
    //     expect(EventInstance.updateEventOccurrences).toHaveBeenCalledWith(mockOrgID, '2023F', 'sem123');
    // });
});
