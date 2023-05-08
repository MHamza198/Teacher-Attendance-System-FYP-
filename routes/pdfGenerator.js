const PDFDocument = require('pdfkit');
const Attendance = require('../models/attendanceModel');

exports.generatePdfReport = async (query) => {
  const doc = new PDFDocument();

  // Set the document properties
  doc.info['Title'] = 'Attendance Report';
  doc.info['Author'] = 'Your Name';
  doc.info['Subject'] = 'Attendance Report';

  // Set the font style and size
  doc.font('Helvetica-Bold');
  doc.fontSize(14);

  // Set the margin and line height
  doc.margin = 50;
  doc.lineGap(12);

  // Add the report header
  doc.text('Attendance Report', { align: 'center', underline: true });
  doc.moveDown();

  // Add the report data
  const attendanceRecords = await Attendance.find(query)
    .populate('degree_name course_name course_code')
    .lean();

  let totalAbsent = 0;
  let totalPresent = 0;
  let totalClasses = attendanceRecords.length;

  // If all courses are selected, group the records by course code and count the attendance
  let courseRecords = {};
  if (!query.course_code || query.course_code === 'all') {
    courseRecords = {};
    attendanceRecords.forEach((record) => {
      if (!courseRecords[record.course_code]) {
        courseRecords[record.course_code] = {
          total: 0,
          present: 0,
          absent: 0,
        };
      }
      courseRecords[record.course_code].total++;
      if (record.attendance === 'Present') {
        courseRecords[record.course_code].present++;
      } else if (record.attendance === 'Absent') {
        courseRecords[record.course_code].absent++;
      }
    });
  }
  

  // Iterate through the attendance records and add them to the report
  attendanceRecords.forEach((record) => {
    doc.fontSize(12);
    doc.text(`Date: ${record.date}`);
    doc.text(`Day: ${record.day}`);
    doc.text(`Degree: ${record.degree_name}`);
    doc.text(`Semester: ${record.semester}`);
    doc.text(`Course Name: ${record.course_name}`);
    doc.text(`Course Code: ${record.course_code}`);
    doc.text(`Attendance: ${record.attendance}`);
    doc.moveDown();

    if (record.attendance === 'Present') {
      totalPresent++;
    } else if (record.attendance === 'Absent') {
      totalAbsent++;
    }
  });

  // Add spacing before the total number of classes, absent, and present
  doc.moveDown();
  doc.moveDown();

  // Add the total number of classes, absent, and present
  doc.fontSize(14);
  doc.text(`Total Classes: ${totalClasses}`, { align: 'right' });
  doc.text(`Total Present: ${totalPresent}`, { align: 'right' });
  doc.text(`Total Absent: ${totalAbsent}`, { align: 'right' });
  doc.moveDown();

  if (!query.course_code || query.course_code === 'all') {
    doc.fontSize(14);
    doc.text('Course Attendance', { align: 'center', underline: true });
    doc.moveDown();
    
    for (const code in courseRecords) {
      const courseRecord = courseRecords[code];
      doc.fontSize(12);
      doc.text(`Course Code: ${code}`);
      doc.text(`Total Classes: ${courseRecord.total}`);
      doc.text(`Total Present: ${courseRecord.present}`);
      doc.text(`Total Absent: ${courseRecord.absent}`);
      // Show the attendance percentages for each course
      const percentPresent = ((courseRecord.present / courseRecord.total) * 100).toFixed(2);
      const percentAbsent = ((courseRecord.absent / courseRecord.total) * 100).toFixed(2);
      doc.text(`Percent Present: ${percentPresent}%`);
      doc.text(`Percent Absent: ${percentAbsent}%`);
  
      doc.moveDown();
    }
  
    // Show the overall attendance percentages for all courses
    const overallPercentPresent = ((totalPresent / totalClasses) * 100).toFixed(2);
    const overallPercentAbsent = ((totalAbsent / totalClasses) * 100).toFixed(2);
  
    doc.fontSize(14);
    doc.text('Overall Attendance', { align: 'center', underline: true });
    doc.moveDown();
    doc.fontSize(12);
    doc.text(`Total Classes: ${totalClasses}`);
    doc.text(`Total Present: ${totalPresent}`);
    doc.text(`Total Absent: ${totalAbsent}`);
    doc.text(`Percent Present: ${overallPercentPresent}%`);
    doc.text(`Percent Absent: ${overallPercentAbsent}%`);
    doc.moveDown();
  }

  // Finalize the PDF and get the buffer
const buffer = await new Promise((resolve) => {
const chunks = [];
doc.on('data', (chunk) => {
chunks.push(chunk);
});
doc.on('end', () => {
resolve(Buffer.concat(chunks));
});
doc.end();
});

return buffer;
};
