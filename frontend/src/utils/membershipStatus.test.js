import { describe, it, expect } from 'vitest';
import { determineMembershipStatusModular } from './membershipStatus';

// language: javascript

describe('determineMembershipStatusModular', () => {
    it('should calculate points correctly with only attendance rule', () => {
        const config = {
            eventTypes: [
                {
                    name: 'eventA',
                    rules: [
                        { criteria: 'attendance', pointValue: 2 }
                    ],
                    maxPoints: null
                }
            ]
        };
        const attendanceData = [
            { eventType: 'eventA', eventDate: '2023-09-01' },
            { eventType: 'eventA', eventDate: '2023-09-02' },
            { eventType: 'eventA', eventDate: '2023-09-03' }
        ];
        const requiredPoints = 6; // expected: 3 * 2 = 6
        const result = determineMembershipStatusModular(attendanceData, config, requiredPoints);
        expect(result.totalPoints).toBe(6);
        expect(result.breakdown.eventA).toBe(6);
        expect(result.status).toBe('active');
    });

    it('should add one off bonus only when at least one event exists', () => {
        const config = {
            eventTypes: [
                {
                    name: 'eventB',
                    rules: [
                        { criteria: 'attendance', pointValue: 1 },
                        { criteria: 'one off', pointValue: 5 }
                    ],
                    maxPoints: null
                }
            ]
        };
        const attendanceData = [
            { eventType: 'eventB', eventDate: '2023-09-01' }
        ];
        const requiredPoints = 6; // expected: 1*1 + 5 = 6
        const result = determineMembershipStatusModular(attendanceData, config, requiredPoints);
        expect(result.totalPoints).toBe(6);
        expect(result.breakdown.eventB).toBe(6);
        expect(result.status).toBe('active');
    });

    it('should apply minimum threshold percentage bonus when applicable', () => {
        const config = {
            eventTypes: [
                {
                    name: 'eventC',
                    occurrenceTotal: 10,
                    rules: [
                        { criteria: 'attendance', pointValue: 1 },
                        { criteria: 'minimum threshold percentage', criteriaValue: 0.5, pointValue: 3 }
                    ],
                    maxPoints: null
                }
            ]
        };
        // Provide 5 events => 5/10 = 0.5 => bonus applies
        const attendanceData = [
            { eventType: 'eventC', eventDate: '2023-09-01' },
            { eventType: 'eventC', eventDate: '2023-09-02' },
            { eventType: 'eventC', eventDate: '2023-09-03' },
            { eventType: 'eventC', eventDate: '2023-09-04' },
            { eventType: 'eventC', eventDate: '2023-09-05' },
        ];
        const requiredPoints = 9; // expected: 5*1 + 3 = 8, so below threshold
        const result = determineMembershipStatusModular(attendanceData, config, requiredPoints);
        expect(result.totalPoints).toBe(8);
        expect(result.breakdown.eventC).toBe(8);
        expect(result.status).toBe('general');
    });

    it('should apply minimum threshold hours bonus when total hours meet threshold', () => {
        const config = {
            eventTypes: [
                {
                    name: 'eventD',
                    rules: [
                        { criteria: 'attendance', pointValue: 0 },
                        { criteria: 'minimum threshold hours', criteriaValue: 5, pointValue: 10 },
                        { criteria: 'minimum threshold hours', criteriaValue: 10, pointValue: 20 }
                    ],
                    maxPoints: null
                }
            ]
        };
        // Provide events with total hours = 12. 
        // Expect the highest rule applies because of break statement, awarding 20 points.
        const attendanceData = [
            { eventType: 'eventD', eventDate: '2023-09-01', hours: 3 },
            { eventType: 'eventD', eventDate: '2023-09-02', hours: 4 },
            { eventType: 'eventD', eventDate: '2023-09-03', hours: 5 },
        ];
        const requiredPoints = 25; // expected: bonus from threshold hours = 20
        const result = determineMembershipStatusModular(attendanceData, config, requiredPoints);
        expect(result.totalPoints).toBe(20);
        expect(result.breakdown.eventD).toBe(20);
        expect(result.status).toBe('general');
    });

    it('should handle multiple event types and sum the points correctly', () => {
        const config = {
            eventTypes: [
                {
                    name: 'eventA',
                    rules: [
                        { criteria: 'attendance', pointValue: 2 },
                        { criteria: 'one off', pointValue: 3 }
                    ],
                    maxPoints: null
                },
                {
                    name: 'eventB',
                    occurrenceTotal: 5,
                    rules: [
                        { criteria: 'attendance', pointValue: 1 },
                        { criteria: 'minimum threshold percentage', criteriaValue: 0.8, pointValue: 4 }
                    ],
                    maxPoints: null
                }
            ]
        };
        const attendanceData = [
            // eventA records: 2 events
            { eventType: 'eventA', eventDate: '2023-09-01' },
            { eventType: 'eventA', eventDate: '2023-09-02' },
            // eventB records: 5 events => 5/5 = 1 so meets percentage rule
            { eventType: 'eventB', eventDate: '2023-09-01' },
            { eventType: 'eventB', eventDate: '2023-09-02' },
            { eventType: 'eventB', eventDate: '2023-09-03' },
            { eventType: 'eventB', eventDate: '2023-09-04' },
            { eventType: 'eventB', eventDate: '2023-09-05' }
        ];
        // Calculate expected:
        // eventA: (2 events * 2 points) + one off (3) = 4 + 3 = 7
        // eventB: (5 events * 1 point) + bonus (4) = 5 + 4 = 9
        // Total = 7 + 9 = 16
        const requiredPoints = 15;
        const result = determineMembershipStatusModular(attendanceData, config, requiredPoints);
        expect(result.totalPoints).toBe(16);
        expect(result.breakdown.eventA).toBe(7);
        expect(result.breakdown.eventB).toBe(9);
        expect(result.status).toBe('active');
    });
});