import axios from 'axios';
import { hr3 } from '@/api/hr3';

/**
 * Service to handle timesheet-related operations
 */
export const timesheetService = {
  /**
   * Process attendance records and transfer eligible ones to timesheet
   * Eligible records are those that:
   * 1. Have all required fields filled (employee_id, date, clock_in, clock_out)
   * 2. Are over 18 hours old based on updated_at timestamp
   */
  processAttendanceForTimesheet: async () => {
    try {
      // Fetch all attendance records
      const response = await axios.get(hr3.backend.api.attendance);
      
      let records = [];
      if (Array.isArray(response.data)) {
        records = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        records = response.data.data;
      }

      // Filter records that are complete and over 18 hours old
      const now = new Date();
      const eligibleRecords = records.filter(record => {
        // Check if record has all required fields
        const isComplete = (
          record.employee_id && 
          record.date && 
          record.clock_in && 
          record.clock_out
        );
        
        // Check if record is over 18 hours old
        const updatedAt = new Date(record.updated_at);
        const hoursDiff = (now - updatedAt) / (1000 * 60 * 60);
        const isOldEnough = hoursDiff >= 18;
        
        return isComplete && isOldEnough;
      });

      // If there are eligible records, transfer them to timesheet
      if (eligibleRecords.length > 0) {
        // Map attendance records to timesheet format
        const timesheetRecords = eligibleRecords.map(record => ({
          attendance_id: record.id,
          employee_id: record.employee_id,
          work_date: record.date,
          start_time: record.clock_in,
          end_time: record.clock_out,
          break_start: record.break_in || null,
          break_end: record.break_out || null,
          status: 'pending',
          // Calculate total hours if needed
          total_hours: calculateTotalHours(
            record.clock_in,
            record.clock_out,
            record.break_in,
            record.break_out
          )
        }));

        // Send records to timesheet API
        await axios.post(hr3.backend.api.timesheet + '/batch', {
          records: timesheetRecords
        });

        return {
          success: true,
          message: `${timesheetRecords.length} records transferred to timesheet`,
          transferredRecords: timesheetRecords
        };
      }

      return {
        success: true,
        message: 'No eligible records found for transfer',
        transferredRecords: []
      };
    } catch (error) {
      console.error('Error processing attendance for timesheet:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message,
        error
      };
    }
  }
};

/**
 * Calculate total hours between clock in and clock out, accounting for breaks
 * @param {string} clockIn - Clock in time (HH:MM format)
 * @param {string} clockOut - Clock out time (HH:MM format)
 * @param {string} breakIn - Break start time (HH:MM format)
 * @param {string} breakOut - Break end time (HH:MM format)
 * @returns {number} - Total hours worked
 */
function calculateTotalHours(clockIn, clockOut, breakIn, breakOut) {
  if (!clockIn || !clockOut) return 0;

  // Parse times to minutes since midnight
  const parseTime = (timeStr) => {
    if (!timeStr) return null;
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const clockInMins = parseTime(clockIn);
  const clockOutMins = parseTime(clockOut);
  
  // Calculate total minutes worked
  let totalMins = clockOutMins - clockInMins;
  
  // Subtract break time if both break in and break out are provided
  if (breakIn && breakOut) {
    const breakInMins = parseTime(breakIn);
    const breakOutMins = parseTime(breakOut);
    const breakDuration = breakOutMins - breakInMins;
    
    // Only subtract if break duration is positive
    if (breakDuration > 0) {
      totalMins -= breakDuration;
    }
  }
  
  // Convert minutes to hours (rounded to 2 decimal places)
  return Math.max(0, parseFloat((totalMins / 60).toFixed(2)));
}