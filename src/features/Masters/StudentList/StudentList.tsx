import React, { useState, useEffect } from "react";
import { Col, Row } from "react-bootstrap";
import { CustomInput, CommonCard } from "../../../app/components/Components";
import agent from "../../../app/api/agent";
import { useAppDispatch } from "../../../app/store/configureStore";
import toast from "react-hot-toast";
import { setLoading } from "../../../app/layout/loadingSlice";
import CommonTable from "../../../app/components/CommonTable";

interface Student {
  admissionNo: string;
  studentName: string;
  fatherName: string;
  className: string;
  sectionName: string;
}

const StudentList: React.FC = () => {
  const dispatch = useAppDispatch();
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);

  const [admissionNoSearch, setAdmissionNoSearch] = useState("");
  const [studentNameSearch, setStudentNameSearch] = useState("");
  const [fatherNameSearch, setFatherNameSearch] = useState("");

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        dispatch(setLoading(true));
        const response = await agent.Student.list();
        setStudents(response);
        setFilteredStudents(response);
      } catch (error) {
        toast.error("Error loading students");
      } finally {
        dispatch(setLoading(false));
      }
    };
    fetchStudents();
  }, [dispatch]);

  useEffect(() => {
    const filtered = students.filter((student) => {
      return (
        student.admissionNo.includes(admissionNoSearch) &&
        student.studentName
          .toLowerCase()
          .includes(studentNameSearch.toLowerCase()) &&
        student.fatherName
          .toLowerCase()
          .includes(fatherNameSearch.toLowerCase())
      );
    });
    setFilteredStudents(filtered);
  }, [admissionNoSearch, studentNameSearch, fatherNameSearch, students]);

   const columns = [
     { header: "Student Name", accessorKey: "studentName", id: "studentName" },
    { header: "Father Name", accessorKey: "fatherName", id: "fatherName" },
    { header: "Class Name", accessorKey: "className", id: "className" },
    { header: "Section Name", accessorKey: "sectionName", id: "sectionName" },
  ];

  return (
    <CommonCard size="100%" header="Student Records">
      <Row className="mb-4">
        <Col md={4}>
          <CustomInput
            label="Admission No."
            name="admissionNoSearch"
            value={admissionNoSearch}
            onChange={(e) => setAdmissionNoSearch(e.target.value)}
          />
        </Col>
        <Col md={4}>
          <CustomInput
            label="Student Name"
            name="studentNameSearch"
            value={studentNameSearch}
            onChange={(e) => setStudentNameSearch(e.target.value)}
          />
        </Col>
        <Col md={4}>
          <CustomInput
            label="Father Name"
            name="fatherNameSearch"
            value={fatherNameSearch}
            onChange={(e) => setFatherNameSearch(e.target.value)}
          />
        </Col>
      </Row>

      <CommonTable
        data={filteredStudents}
        columns={columns}
        showSrNo={true}
        usePagination={false}
      />
    </CommonCard>
  );
};

export default StudentList;
