import { AnimalType, Movement, SyncStorage } from "../types";
import { MessageManager } from "../utils";

describe("MessageManager", () => {
  let messageManager: MessageManager;

  beforeEach(() => {
    messageManager = new MessageManager();
  });

  describe("checkTimeRangeAndActivate", () => {
    let mockChrome: {
      tabs: {
        query: jest.Mock;
        sendMessage: jest.Mock;
      };
    };

    beforeEach(() => {
      // Mock chrome API
      mockChrome = {
        tabs: {
          query: jest.fn(),
          sendMessage: jest.fn(),
        },
      } as any;

      (global as any).chrome = mockChrome;
    });

    it("should activate when current time is within range", () => {
      const now = new Date("2024-03-15T14:30:00");
      jest.useFakeTimers().setSystemTime(now);

      const storage: SyncStorage = {
        startTime: "03/15/24 14:00",
        endTime: "03/15/24 15:00",
        animal: AnimalType.Flappy,
        intervalMinutes: 60,
        animalCnt: 10,
        animalverseOn: true,
        speed: 100,
        movement: Movement.AroundScreen,
        height: 50,
      };

      const mockTabs = [{ id: 1 }];
      mockChrome.tabs.query.mockImplementation((_, callback) =>
        callback(mockTabs)
      );

      messageManager.checkTimeRangeAndActivate(
        storage.startTime,
        storage.endTime,
        storage.animal,
        storage.animalCnt,
        storage.animalverseOn,
        storage.speed,
        storage.movement,
        storage.height
      );

      expect(mockChrome.tabs.query).toHaveBeenCalled();
      expect(mockChrome.tabs.sendMessage).toHaveBeenCalledWith(1, {
        action: "showAnimal",
        animal: AnimalType.Flappy,
        animalCnt: 10,
        speed: 100,
        movement: Movement.AroundScreen,
        height: 50,
      });
    });

    it("should not activate when current time is outside range", () => {
      const now = new Date("2024-03-15T16:00:00");
      jest.useFakeTimers().setSystemTime(now);

      const storage: SyncStorage = {
        startTime: "03/15/24 14:00",
        endTime: "03/15/24 15:00",
        animal: AnimalType.Flappy,
        intervalMinutes: 60,
        animalCnt: 10,
        animalverseOn: true,
        speed: 100,
        movement: Movement.AroundScreen,
        height: 50,
      };

      messageManager.checkTimeRangeAndActivate(
        storage.startTime,
        storage.endTime,
        storage.animal,
        storage.animalCnt,
        storage.animalverseOn,
        storage.speed,
        storage.movement,
        storage.height
      );

      expect(mockChrome.tabs.query).not.toHaveBeenCalled();
      expect(mockChrome.tabs.sendMessage).not.toHaveBeenCalled();
    });
  });
});
