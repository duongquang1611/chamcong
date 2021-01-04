import Axios from "axios";
import companyModel from "../../models/company.model.js";
import companyConfigModel from "../../models/companyConfig.model.js";
import dotenv from "dotenv";
import commons from "../../commons/index.js";
import moment from "moment";
import mongoose from "mongoose";
import userModel from "../../models/user.model.js";
const { Types } = mongoose;

dotenv.config();

const getDetailCompany = async (companyId) => {
  try {
    let company = await companyModel
      .findOne({ _id: companyId }, " -__v")
      .populate({ path: "createdBy", select: "-__v -password" })
      .populate({ path: "updatedBy", select: "-__v -password" });
    let config = await companyConfigModel.findOne({ companyId: companyId });

    company = { ...company._doc, config: { ...config._doc } };
    return company || {};
  } catch (error) {
    return {};
  }
};
const createReport = async (data, daysInMonth, companyId) => {
  let usersInCompany = await userModel.aggregate([
    { $match: { companyId: Types.ObjectId(companyId) } },
    commons.lookUp("roleId", "roles", "_id", "roleId"),
    { $unwind: { path: "$roleId", preserveNullAndEmptyArrays: true } },
    { $sort: { "roleId.level": -1 } },
  ]);

  let dataEachUser = null;
  let dayActiveWork = [];
  let dataComeLate = [];
  let dataLeaveEarly = [];
  let rowData = [[], [], []];
  let msgWorkDay = 0;
  let msgComeLate = 0;
  let msgLeaveEarly = 0;
  let tableData = { workDay: [], comeLate: [], leaveEarly: [] };
  usersInCompany.forEach((userData, index) => {
    dataEachUser = data[userData?._id];
    rowData = [[], [], []];
    if (dataEachUser) {
      dayActiveWork = dataEachUser
        .filter((item) => item?.isSuccessDay)
        .map((item) => item.day);

      dataComeLate = dataEachUser.filter((item) => {
        if (item?.minutesComeLate) return item.minutesComeLate > 0;
        return;
      });
      dataLeaveEarly = dataEachUser.filter((item) => {
        if (item?.minutesLeaveEarly) return item.minutesLeaveEarly > 0;
        return;
      });
    } else {
      dayActiveWork = [];
      dataComeLate = [];
      dataLeaveEarly = [];
    }
    for (let j = -3; j < daysInMonth + 2; j++) {
      switch (j) {
        case -3:
          rowData[0].push(index + 1);
          rowData[1].push(index + 1);
          rowData[2].push(index + 1);
          break;
        case -2:
          rowData[0].push(userData?.name);
          rowData[1].push(userData?.name);
          rowData[2].push(userData?.name);
          break;
        case -1:
          rowData[0].push(userData?.roleId?.name);
          rowData[1].push(userData?.roleId?.name);
          rowData[2].push(userData?.roleId?.name);
          break;
        case 0:
          let dateFormat = commons.noData;
          if (userData?.dateOfBirth) {
            dateFormat = moment(userData?.dateOfBirth).format(
              commons.FORMAT_DATE_VN
            );
          }
          rowData[0].push(dateFormat);
          rowData[1].push(dateFormat);
          rowData[2].push(dateFormat);
          break;
        case daysInMonth + 1:
          // sum
          msgWorkDay = 0;
          msgComeLate = 0;
          msgLeaveEarly = 0;
          if (dataEachUser && dataEachUser.length > 0 && dayActiveWork) {
            msgWorkDay = dayActiveWork.length;
          }
          if (dataComeLate && dataComeLate.length > 0)
            msgComeLate = dataComeLate.reduce(
              (accumulator, currentValue) =>
                accumulator + currentValue.minutesComeLate,
              0
            );
          if (dataLeaveEarly && dataLeaveEarly.length > 0)
            msgLeaveEarly = dataLeaveEarly.reduce(
              (accumulator, currentValue) =>
                accumulator + currentValue.minutesLeaveEarly,
              0
            );
          rowData[0].push(msgWorkDay);
          rowData[1].push(msgComeLate + "ph");
          rowData[2].push(msgLeaveEarly + "ph");
          break;

        default:
          // check or uncheck
          msgWorkDay = "";
          msgComeLate = "";
          msgLeaveEarly = "";
          if (dayActiveWork && dayActiveWork.length > 0) {
            if (dayActiveWork.includes(j)) msgWorkDay = "X";
          }
          if (dataComeLate && dataComeLate.length > 0) {
            let dayComeLate = dataComeLate.find((item) => item.day == j);
            if (dayComeLate) msgComeLate = dayComeLate.minutesComeLate;
          }
          if (dataLeaveEarly && dataLeaveEarly.length > 0) {
            let dayLeaveEarly = dataLeaveEarly.find((item) => item.day == j);
            if (dayLeaveEarly) msgLeaveEarly = dayLeaveEarly.minutesLeaveEarly;
          }

          rowData[0].push(msgWorkDay);
          rowData[1].push(msgComeLate ? msgComeLate + "ph" : msgComeLate);
          rowData[2].push(msgLeaveEarly ? msgLeaveEarly + "ph" : msgLeaveEarly);
          break;
      }
    }
    tableData.workDay.push(rowData[0]);
    tableData.comeLate.push(rowData[1]);
    tableData.leaveEarly.push(rowData[2]);
  });
  return tableData;
};
const companyResources = {
  getDetailCompany,
  createReport,
};
export default companyResources;
