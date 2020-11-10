import handleError from "./handleError.js";
import jwt from "jsonwebtoken";
import config from "../config/index.js";
import mongoose from "mongoose";
import moment from "moment";
const formatDayWork = "YYYY-MM-DD";

const getUserIdInToken = (req) => {
  const authorization = req.header("Authorization");
  const tokenArray = authorization.split(" ");
  const token = tokenArray[1];
  const decodedToken = jwt.verify(token, config.JWT_SECRET);
  return decodedToken;
};

const getDiffTime = (date1, date2 = new Date()) => {
  // date full
  let diff = moment
    .utc(moment(date2, "HH:mm:ss").diff(date1))
    .format("HH:mm:ss");
  return diff;
};

const setTimeToDate = (time, date = new Date()) => {
  // date: format ISOString, exam: 2020-11-06T10:18:33.145Z
  // time: HH:mm:ss
  console.log(time);
  let pieces = time.split(":");
  let hour = 0,
    minute = 0,
    second = 0;
  if (pieces.length === 3) {
    hour = parseInt(pieces[0], 10);
    minute = parseInt(pieces[1], 10);
    second = parseInt(pieces[2], 10);
  }
  date.setSeconds(second);
  date.setMinutes(minute);
  date.setHours(hour);
  return date;
};

const isBeforeDate = (date1, date2) => {
  let check = new Date(date1).getTime() - new Date(date2).getTime();
  return check < 0;
};
const subDateToTime = (date1, date2, hasAbs = true) => {
  if (hasAbs) {
    return Math.abs(new Date(date1).getTime() - new Date(date2).getTime());
  }
  return new Date(date1).getTime() - new Date(date2).getTime();
};

const getDurationToMinutes = (date1, date2, hasAbs = true, round = true) => {
  let diff = subDateToTime(date1, date2, hasAbs);
  let minutes = moment.duration(diff).asMinutes();

  if (round) {
    return Math.round(minutes);
  }
  return minutes;
};

const commons = {
  handleError,
  getUserIdInToken,
  formatDayWork,
  getDiffTime,
  setTimeToDate,
  subDateToTime,
  getDurationToMinutes,
  isBeforeDate,
};

export default commons;
