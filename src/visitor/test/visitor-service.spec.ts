import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { UnauthorizedException, NotFoundException } from '@nestjs/common';
import { Visitor } from '../schemas/visitor.schema';
import { VisitorService } from '../visitor.service';

describe('VisitorService', () => {
  let visitorService: VisitorService;
  let visitorModel: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VisitorService,
        {
          provide: getModelToken(Visitor.name),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            findOneAndDelete: jest.fn(),
            deleteMany: jest.fn(),
            findOneAndUpdate: jest.fn(),
          },
        },
      ],
    }).compile();

    visitorService = module.get<VisitorService>(VisitorService);
    visitorModel = module.get(getModelToken(Visitor.name));
  });

  describe('findAll', () => {
    it('should return an array of visitors for the specified pubCode', async () => {
      const mockPubCode = 'pubCode';
      const mockVisitors = [
        { name: 'John', tableNum: 1 },
        { name: 'Jane', tableNum: 2 },
      ];
      visitorModel.find.mockResolvedValue(mockVisitors);

      const result = await visitorService.findAll(mockPubCode);

      expect(visitorModel.find).toHaveBeenCalledWith({ code: mockPubCode });
      expect(result).toEqual(mockVisitors);
    });

    it('should throw an UnauthorizedException if no visitors are found', async () => {
      const mockPubCode = 'pubCode';
      visitorModel.find.mockResolvedValue(null);

      await expect(visitorService.findAll(mockPubCode)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('create', () => {
    it('should create a new visitor and return it', async () => {
      const mockVisitor: Visitor = {
        name: 'John',
        tableNum: 1,
        credits: 2,
        code: 'CAJU',
      };
      visitorModel.findOne.mockResolvedValue(null);
      visitorModel.create.mockResolvedValue(mockVisitor);

      const result = await visitorService.create(mockVisitor);

      expect(visitorModel.findOne).toHaveBeenCalledWith({
        name: mockVisitor.name,
        tableNum: mockVisitor.tableNum,
      });
      expect(visitorModel.create).toHaveBeenCalledWith(mockVisitor);
      expect(result).toEqual(mockVisitor);
    });

    it('should throw an UnauthorizedException if a visitor with the same name and table number already exists', async () => {
      const mockVisitor: Visitor = {
        name: 'John',
        tableNum: 1,
        credits: 2,
        code: 'CAJU',
      };
      visitorModel.findOne.mockResolvedValue(mockVisitor);

      await expect(visitorService.create(mockVisitor)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('findById', () => {
    it('should return the visitor with the specified id and pubCode', async () => {
      const mockId = '123456';
      const mockPubCode = 'pubCode';
      const mockVisitor: Visitor = {
        name: 'John',
        tableNum: 1,
        credits: 2,
        code: 'CAJU',
      };
      visitorModel.findOne.mockResolvedValue(mockVisitor);

      const result = await visitorService.findById(mockId, mockPubCode);

      expect(visitorModel.findOne).toHaveBeenCalledWith({
        _id: mockId,
        code: mockPubCode,
      });
      expect(result).toEqual(mockVisitor);
    });

    it('should throw a NotFoundException if the visitor is not found', async () => {
      const mockId = '123456';
      const mockPubCode = 'pubCode';
      visitorModel.findOne.mockResolvedValue(null);

      await expect(
        visitorService.findById(mockId, mockPubCode),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByNameAndTable', () => {
    it('should return the visitor with the specified name and table number', async () => {
      const mockName = 'John';
      const mockTable = 1;
      const mockVisitor: Visitor = {
        name: 'John',
        tableNum: 1,
        credits: 2,
        code: 'CAJU',
      };
      visitorModel.findOne.mockResolvedValue(mockVisitor);

      const result = await visitorService.findByNameAndTable(
        mockName,
        mockTable,
      );

      expect(visitorModel.findOne).toHaveBeenCalledWith({
        name: mockName,
        tableNum: mockTable,
      });
      expect(result).toEqual(mockVisitor);
    });
  });

  describe('findByTable', () => {
    it('should return an array of visitors for the specified pubCode and table number', async () => {
      const mockPubCode = 'pubCode';
      const mockTableNum = 1;
      const mockVisitors = [
        { name: 'John', tableNum: 1 },
        { name: 'Jane', tableNum: 1 },
      ];
      visitorModel.find.mockResolvedValue(mockVisitors);

      const result = await visitorService.findByTable(
        mockPubCode,
        mockTableNum,
      );

      expect(visitorModel.find).toHaveBeenCalledWith({
        code: mockPubCode,
        tableNum: mockTableNum,
      });
      expect(result).toEqual(mockVisitors);
    });

    it('should throw a NotFoundException if no visitors are found for the specified pubCode and table number', async () => {
      const mockPubCode = 'pubCode';
      const mockTableNum = 1;
      visitorModel.find.mockResolvedValue(null);

      await expect(
        visitorService.findByTable(mockPubCode, mockTableNum),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findTable', () => {
    it('should return an array of unique table numbers for the specified pubCode', async () => {
      const mockPubCode = 'pubCode';
      const mockVisitors = [
        { name: 'John', tableNum: 1 },
        { name: 'Jane', tableNum: 2 },
        { name: 'Bob', tableNum: 1 },
      ];
      visitorModel.find.mockResolvedValue(mockVisitors);

      const result = await visitorService.findTable(mockPubCode);

      expect(visitorModel.find).toHaveBeenCalledWith(
        { code: mockPubCode },
        {
          _id: 0,
          name: 0,
          active: 0,
          credits: 0,
          createdAt: 0,
          updatedAt: 0,
          __v: 0,
        },
      );
      expect(result).toEqual([1, 2]);
    });
  });

  describe('deleteById', () => {
    it('should delete the visitor with the specified id and pubCode', async () => {
      const mockId = '123456';
      const mockPubCode = 'pubCode';
      visitorModel.findOneAndDelete.mockResolvedValue({});

      await visitorService.deleteById(mockPubCode, mockId);

      expect(visitorModel.findOneAndDelete).toHaveBeenCalledWith({
        _id: mockId,
        code: mockPubCode,
      });
    });
  });

  describe('deleteByTable', () => {
    it('should delete visitors for the specified pubCode and table number', async () => {
      const mockPubCode = 'pubCode';
      const mockTableNum = 1;
      visitorModel.deleteMany.mockResolvedValue({});

      await visitorService.deleteByTable(mockPubCode, mockTableNum);

      expect(visitorModel.deleteMany).toHaveBeenCalledWith({
        code: mockPubCode,
        tableNum: mockTableNum,
      });
    });
  });

  describe('updateCredit', () => {
    it('should update the credits of the visitor and return the updated visitor', async () => {
      const mockVisitor = { _id: '123456', credits: 10 };
      const mockUpdatedVisitor = {
        _id: '123456',
        credits: 9,
        updatedAt: new Date(),
      };
      visitorModel.findOneAndUpdate.mockResolvedValue(mockUpdatedVisitor);

      const result = await visitorService.updateCredit(mockVisitor);

      expect(visitorModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: mockVisitor._id },
        {
          $set: {
            credits: mockVisitor.credits - 1,
            updatedAt: expect.any(Date),
          },
        },
      );
      expect(result).toEqual(mockUpdatedVisitor);
    });
  });
});
