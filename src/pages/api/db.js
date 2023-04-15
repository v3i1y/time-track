// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { PrismaClient } from "@prisma/client";

export const config = { rpc: true };

const prisma = new PrismaClient();

const epochSecondsToDate = (epochSeconds) => {
  return epochSeconds * 1000;
};

const dateToEpochSeconds = (date) => {
  return Math.floor(date / 1000);
};

// 1. Upsert function
export async function upsertTimeBlock(data) {
  let { startDateTime, endDateTime, spentOn, id } = data;

  startDateTime = dateToEpochSeconds(startDateTime);
  endDateTime = dateToEpochSeconds(endDateTime);

  if (data.id) {
    return await prisma.timeBlock.update({
      where: { id },
      data: {
        startDateTime,
        endDateTime,
        spentOn,
      },
    })
  } else {
    return await prisma.timeBlock.create({
      data: {
        startDateTime,
        endDateTime,
        spentOn,
      },
    })
  }
}

// 2. List function
export async function listTimeBlocks(startDateRange, endDateRange) {
  let filter = {};

  if (startDateRange && endDateRange) {
    filter = {
      startDateTime: {
        gte: dateToEpochSeconds(startDateRange),
        lte: dateToEpochSeconds(endDateRange),
      },
    };
  }

  const timeBlocks = await prisma.timeBlock.findMany({
    where: filter,
  });

  return timeBlocks.map((tb) => ({
    ...tb,
    startDateTime: epochSecondsToDate(tb.startDateTime),
    endDateTime: epochSecondsToDate(tb.endDateTime),
  }));
}

// 3. Delete function
export async function deleteTimeBlock({ id }) {
  console.log(id);
  const deletedTimeBlock = await prisma.timeBlock.delete({
    where: { id },
  });

  return deletedTimeBlock;
}