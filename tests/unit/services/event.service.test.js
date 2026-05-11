import { describe, test, expect, beforeEach, jest } from '@jest/globals';

const EventRepo = {
    isEventExists: jest.fn(),
    getEventStatusAndTiming: jest.fn(),
    isStudentRegisteredForEvent: jest.fn(),
    getEventCapacity: jest.fn(),
    getEventRegistrationCount: jest.fn(),
    registerStudentForEvent: jest.fn(),
    cancelStudentRegistration: jest.fn(),
    isStudentCheckedIn: jest.fn(),
    checkInStudent: jest.fn(),
    scheduleEvent: jest.fn(),
    deleteEvent: jest.fn(),
    getEventById: jest.fn(),
};

const clubService = {
    getClubIdByManagerId: jest.fn(),
    findClubById: jest.fn(),
};

jest.unstable_mockModule('../../../src/repositories/event.repository.js', () => ({ default: EventRepo }));
jest.unstable_mockModule('../../../src/services/club.service.js', () => ({ default: clubService }));

const { default: eventService } = await import('../../../src/services/event.service.js');

describe('EventService.registerStudentAtEvent', () => {
    beforeEach(() => {
        Object.values(EventRepo).forEach((fn) => fn.mockReset && fn.mockReset());
        Object.values(clubService).forEach((fn) => fn.mockReset && fn.mockReset());
    });

    test('throws "Event not found" when event does not exist', async () => {
        EventRepo.isEventExists.mockResolvedValue(false);
        await expect(eventService.registerStudentAtEvent(1, 2)).rejects.toThrow('Event not found');
    });

    test('throws "Registration closed" when event status is not scheduled', async () => {
        EventRepo.isEventExists.mockResolvedValue(true);
        EventRepo.getEventStatusAndTiming.mockResolvedValue({
            status: 'pending',
            event_start_date: new Date(Date.now() + 3600_000),
        });
        await expect(eventService.registerStudentAtEvent(1, 2)).rejects.toThrow('Registration closed');
    });

    test('throws "Registration deadline passed" when current time >= event start', async () => {
        EventRepo.isEventExists.mockResolvedValue(true);
        EventRepo.getEventStatusAndTiming.mockResolvedValue({
            status: 'scheduled',
            event_start_date: new Date(Date.now() - 1000),
        });
        await expect(eventService.registerStudentAtEvent(1, 2)).rejects.toThrow('Registration deadline passed');
    });

    test('throws "Already registered" when student is already registered', async () => {
        EventRepo.isEventExists.mockResolvedValue(true);
        EventRepo.getEventStatusAndTiming.mockResolvedValue({
            status: 'scheduled',
            event_start_date: new Date(Date.now() + 3600_000),
        });
        EventRepo.isStudentRegisteredForEvent.mockResolvedValue(true);
        await expect(eventService.registerStudentAtEvent(1, 2)).rejects.toThrow('Already registered');
    });

    test('throws "Event is full" when capacity reached', async () => {
        EventRepo.isEventExists.mockResolvedValue(true);
        EventRepo.getEventStatusAndTiming.mockResolvedValue({
            status: 'scheduled',
            event_start_date: new Date(Date.now() + 3600_000),
        });
        EventRepo.isStudentRegisteredForEvent.mockResolvedValue(false);
        EventRepo.getEventCapacity.mockResolvedValue({ max_capacity: 5 });
        EventRepo.getEventRegistrationCount.mockResolvedValue(5);
        await expect(eventService.registerStudentAtEvent(1, 2)).rejects.toThrow('Event is full');
    });

    test('succeeds and returns registration id on happy path', async () => {
        EventRepo.isEventExists.mockResolvedValue(true);
        EventRepo.getEventStatusAndTiming.mockResolvedValue({
            status: 'scheduled',
            event_start_date: new Date(Date.now() + 3600_000),
        });
        EventRepo.isStudentRegisteredForEvent.mockResolvedValue(false);
        EventRepo.getEventCapacity.mockResolvedValue({ max_capacity: 5 });
        EventRepo.getEventRegistrationCount.mockResolvedValue(2);
        EventRepo.registerStudentForEvent.mockResolvedValue(123);

        const id = await eventService.registerStudentAtEvent(1, 2);
        expect(id).toBe(123);
        expect(EventRepo.registerStudentForEvent).toHaveBeenCalledWith(1, 2);
    });

    test('proceeds when event has no max_capacity set', async () => {
        EventRepo.isEventExists.mockResolvedValue(true);
        EventRepo.getEventStatusAndTiming.mockResolvedValue({
            status: 'scheduled',
            event_start_date: new Date(Date.now() + 3600_000),
        });
        EventRepo.isStudentRegisteredForEvent.mockResolvedValue(false);
        EventRepo.getEventCapacity.mockResolvedValue({ max_capacity: null });
        EventRepo.registerStudentForEvent.mockResolvedValue(5);
        const id = await eventService.registerStudentAtEvent(1, 2);
        expect(id).toBe(5);
        expect(EventRepo.getEventRegistrationCount).not.toHaveBeenCalled();
    });
});

describe('EventService.cancelEventRegistration', () => {
    beforeEach(() => {
        Object.values(EventRepo).forEach((fn) => fn.mockReset && fn.mockReset());
    });

    test('throws "Event not found" when event does not exist', async () => {
        EventRepo.isEventExists.mockResolvedValue(false);
        await expect(eventService.cancelEventRegistration(1, 2)).rejects.toThrow('Event not found');
    });

    test('throws "Registration not found" when student is not registered', async () => {
        EventRepo.isEventExists.mockResolvedValue(true);
        EventRepo.isStudentRegisteredForEvent.mockResolvedValue(false);
        await expect(eventService.cancelEventRegistration(1, 2)).rejects.toThrow('Registration not found');
    });

    test('cancels successfully', async () => {
        EventRepo.isEventExists.mockResolvedValue(true);
        EventRepo.isStudentRegisteredForEvent.mockResolvedValue(true);
        EventRepo.cancelStudentRegistration.mockResolvedValue(true);
        const r = await eventService.cancelEventRegistration(1, 2);
        expect(r).toBe(true);
    });
});

describe('EventService.checkInStudent', () => {
    beforeEach(() => {
        Object.values(EventRepo).forEach((fn) => fn.mockReset && fn.mockReset());
    });

    test('throws when student not registered', async () => {
        EventRepo.isEventExists.mockResolvedValue(true);
        EventRepo.isStudentRegisteredForEvent.mockResolvedValue(false);
        await expect(eventService.checkInStudent(1, 2)).rejects.toThrow('Student not registered');
    });

    test('throws when already checked in', async () => {
        EventRepo.isEventExists.mockResolvedValue(true);
        EventRepo.isStudentRegisteredForEvent.mockResolvedValue(true);
        EventRepo.isStudentCheckedIn.mockResolvedValue(true);
        await expect(eventService.checkInStudent(1, 2)).rejects.toThrow('Already checked in');
    });

    test('returns check-in id on happy path', async () => {
        EventRepo.isEventExists.mockResolvedValue(true);
        EventRepo.isStudentRegisteredForEvent.mockResolvedValue(true);
        EventRepo.isStudentCheckedIn.mockResolvedValue(false);
        EventRepo.checkInStudent.mockResolvedValue(42);
        const r = await eventService.checkInStudent(1, 2);
        expect(r).toBe(42);
    });
});

describe('EventService.scheduleEvent', () => {
    beforeEach(() => {
        Object.values(EventRepo).forEach((fn) => fn.mockReset && fn.mockReset());
        Object.values(clubService).forEach((fn) => fn.mockReset && fn.mockReset());
    });

    test('throws when manager has no club', async () => {
        clubService.getClubIdByManagerId.mockResolvedValue(null);
        await expect(eventService.scheduleEvent(1, { title: 'x' })).rejects.toThrow('Club not found');
    });

    test('injects club_id and delegates to repo', async () => {
        clubService.getClubIdByManagerId.mockResolvedValue(7);
        EventRepo.scheduleEvent.mockResolvedValue({ event_id: 1 });
        const r = await eventService.scheduleEvent(1, { title: 'x' });
        expect(EventRepo.scheduleEvent).toHaveBeenCalledWith(expect.objectContaining({ club_id: 7 }));
        expect(r).toEqual({ event_id: 1 });
    });
});
