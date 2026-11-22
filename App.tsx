
import { useEffect, useState } from 'react'
import './App.css'

type MarkEntry = {
  subject: string
  obtained: number
  maximum: number
}

type ExamRecord = {
  exam: string
  entries: MarkEntry[]
  updatedAt: string
}

type Student = {
  id: number
  name: string
  studentClass: string
  school: string
  parent: string
  mobile: string
  photo: string
  subjects: string[]
  completedDays?: number[]
  marks?: ExamRecord[]
}

type MarkInput = {
  obtained: string
  maximum: string
}

const exams = ['FA-1', 'FA-2', 'SA-1', 'FA-3', 'FA-4', 'SA-2']

const defaultSubjects: Record<string, string[]> = {
  '6th': ['Telugu', 'Hindi', 'English', 'Mathematics', 'Science', 'Social Studies'],
  '7th': ['Telugu', 'Hindi', 'English', 'Mathematics', 'Science', 'Social Studies'],
  '8th': ['Telugu', 'Hindi', 'English', 'Mathematics', 'Physical Science', 'Biological Science', 'Social Studies'],
  '9th': ['Telugu', 'Hindi', 'English', 'Mathematics', 'Physical Science', 'Biological Science', 'Social Studies'],
  '10th': ['Telugu', 'Hindi', 'English', 'Mathematics', 'Physical Science', 'Biological Science', 'Social Studies'],
  Inter: ['English', 'Second Language', 'Subject 1', 'Subject 2', 'Subject 3'],
  Diploma: ['English', 'Engineering Mathematics', 'Applied Physics', 'Applied Chemistry', 'Branch Subject 1', 'Branch Subject 2'],
}

function App() {
  // LOGIN SYSTEM

  const [loginRole, setLoginRole] = useState<'admin' | 'student' | null>(null)
  const [loginUsername, setLoginUsername] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loggedInStudentId, setLoggedInStudentId] = useState<number | null>(null)

  const [page, setPage] = useState('Dashboard')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null)

  // STUDENT DATA

  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem('littleScholarsStudents') || '[]'
      )

      if (!Array.isArray(saved)) return []

      return saved.map((student: Student) => ({
        ...student,
        subjects: student.subjects ?? defaultSubjects[student.studentClass] ?? [],
        completedDays: student.completedDays ?? [],
        marks: student.marks ?? [],
      }))
    } catch {
      return []
    }
  })

  // STUDENT FORM

  const [name, setName] = useState('')
  const [studentClass, setStudentClass] = useState('10th')
  const [school, setSchool] = useState('')
  const [parent, setParent] = useState('')
  const [mobile, setMobile] = useState('')
  const [photo, setPhoto] = useState('')
  const [subjectsText, setSubjectsText] = useState(
    defaultSubjects['10th'].join(', ')
  )

  // MARKS MANAGEMENT

  const [marksStudentId, setMarksStudentId] = useState<number | null>(null)
  const [selectedExam, setSelectedExam] = useState('FA-1')
  const [markInputs, setMarkInputs] = useState<Record<string, MarkInput>>({})

  // REPORTS

  const [reportStudentId, setReportStudentId] = useState<number | null>(null)

  // SAVE STUDENTS

  useEffect(() => {
    try {
      localStorage.setItem(
        'littleScholarsStudents',
        JSON.stringify(students)
      )
    } catch {
      alert('Unable to save data. Please download a backup.')
    }
  }, [students])

  // LOGIN FUNCTIONS

  function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoginError('')

    // ADMIN LOGIN
    if (
      loginUsername.trim().toLowerCase() === 'admin' &&
      loginPassword === 'LS@12345'
    ) {
      setLoginRole('admin')
      setLoggedInStudentId(null)
      setPage('Dashboard')
      setLoginUsername('')
      setLoginPassword('')
      return
    }

    // STUDENT LOGIN
    // Username: LS followed by student ID
    // Password: Registered parent mobile number

    const student = students.find(
      s =>
        `LS${s.id}`.toLowerCase() === loginUsername.trim().toLowerCase() &&
        s.mobile === loginPassword
    )

    if (student) {
      setLoginRole('student')
      setLoggedInStudentId(student.id)
      setPage('Student Portal')
      setLoginUsername('')
      setLoginPassword('')
      return
    }

    setLoginError('Invalid username or password. Please try again.')
  }

  function handleLogout() {
    setLoginRole(null)
    setLoggedInStudentId(null)
    setLoginUsername('')
    setLoginPassword('')
    setLoginError('')
    setShowPassword(false)
    setPage('Dashboard')
    setSelectedStudentId(null)
    setMarksStudentId(null)
    setReportStudentId(null)
    resetForm()
  }

  // STUDENT FORM FUNCTIONS

  function resetForm() {
    setEditingId(null)
    setName('')
    setStudentClass('10th')
    setSchool('')
    setParent('')
    setMobile('')
    setPhoto('')
    setSubjectsText(defaultSubjects['10th'].join(', '))
  }

  function changeClass(value: string) {
    setStudentClass(value)
    setSubjectsText((defaultSubjects[value] ?? []).join(', '))
  }

  function handlePhoto(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('Photo must be smaller than 2 MB.')
      return
    }

    const reader = new FileReader()
    reader.onload = () => setPhoto(String(reader.result))
    reader.readAsDataURL(file)
  }

  function addStudent(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const subjects = subjectsText
      .split(',')
      .map(subject => subject.trim())
      .filter(Boolean)

    if (!subjects.length) {
      alert('Please enter at least one subject.')
      return
    }

    if (editingId !== null) {
      setStudents(previous =>
        previous.map(student =>
          student.id === editingId
            ? {
                ...student,
                name,
                studentClass,
                school,
                parent,
                mobile,
                photo,
                subjects,
              }
            : student
        )
      )

      alert('Student details updated successfully!')
    } else {
      const newStudent: Student = {
        id: Date.now(),
        name,
        studentClass,
        school,
        parent,
        mobile,
        photo,
        subjects,
        completedDays: [],
        marks: [],
      }

      setStudents(previous => [...previous, newStudent])

      alert(
        `Student registered successfully!\n\nStudent Username: LS${newStudent.id}\nStudent Password: ${newStudent.mobile}\n\nPlease share these demo credentials with the student.`
      )
    }

    resetForm()
  }

  function editStudent(student: Student) {
    setEditingId(student.id)
    setName(student.name)
    setStudentClass(student.studentClass)
    setSchool(student.school)
    setParent(student.parent)
    setMobile(student.mobile)
    setPhoto(student.photo)
    setSubjectsText(
      (student.subjects ?? defaultSubjects[student.studentClass] ?? []).join(', ')
    )
    setPage('Students')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function deleteStudent(id: number) {
    if (window.confirm('Are you sure you want to delete this student?')) {
      setStudents(previous => previous.filter(student => student.id !== id))

      if (editingId === id) resetForm()
      if (selectedStudentId === id) setSelectedStudentId(null)

      if (marksStudentId === id) {
        setMarksStudentId(null)
        setMarkInputs({})
      }

      if (reportStudentId === id) setReportStudentId(null)
    }
  }

  function openProfile(id: number) {
    setSelectedStudentId(id)
    setPage('Student Profile')
  }

  // 100 DAYS PROGRAMME

  function toggleDay(studentId: number, day: number) {
    setStudents(previous =>
      previous.map(student => {
        if (student.id !== studentId) return student

        const completed = student.completedDays ?? []

        const updatedDays = completed.includes(day)
          ? completed.filter(d => d !== day)
          : [...completed, day]

        return {
          ...student,
          completedDays: updatedDays,
        }
      })
    )
  }

  // MARKS FUNCTIONS

  function loadMarks(studentId: number | null, exam: string) {
    if (studentId === null) {
      setMarkInputs({})
      return
    }

    const student = students.find(s => s.id === studentId)

    if (!student) {
      setMarkInputs({})
      return
    }

    const existingRecord = (student.marks ?? []).find(
      record => record.exam === exam
    )

    const inputs: Record<string, MarkInput> = {}

    ;(student.subjects ?? []).forEach(subject => {
      const existing = existingRecord?.entries.find(
        entry => entry.subject === subject
      )

      inputs[subject] = {
        obtained: existing ? String(existing.obtained) : '',
        maximum: existing ? String(existing.maximum) : '',
      }
    })

    existingRecord?.entries.forEach(entry => {
      if (!inputs[entry.subject]) {
        inputs[entry.subject] = {
          obtained: String(entry.obtained),
          maximum: String(entry.maximum),
        }
      }
    })

    setMarkInputs(inputs)
  }

  function chooseMarksStudent(id: number | null) {
    setMarksStudentId(id)
    loadMarks(id, selectedExam)
  }

  function chooseExam(exam: string) {
    setSelectedExam(exam)
    loadMarks(marksStudentId, exam)
  }

  function updateMark(
    subject: string,
    field: 'obtained' | 'maximum',
    value: string
  ) {
    setMarkInputs(previous => ({
      ...previous,
      [subject]: {
        obtained: previous[subject]?.obtained ?? '',
        maximum: previous[subject]?.maximum ?? '',
        [field]: value,
      },
    }))
  }

  function saveMarks() {
    const student = students.find(s => s.id === marksStudentId)

    if (!student) {
      alert('Please select a student first.')
      return
    }

    const entries: MarkEntry[] = []

    for (const subject of Object.keys(markInputs)) {
      const obtainedText = markInputs[subject].obtained.trim()
      const maximumText = markInputs[subject].maximum.trim()

      if (obtainedText === '' || maximumText === '') {
        alert(`Please enter both obtained and maximum marks for ${subject}.`)
        return
      }

      const obtained = Number(obtainedText)
      const maximum = Number(maximumText)

      if (
        !Number.isFinite(obtained) ||
        !Number.isFinite(maximum) ||
        obtained < 0 ||
        maximum <= 0 ||
        obtained > maximum
      ) {
        alert(`Please enter valid marks for ${subject}.`)
        return
      }

      entries.push({ subject, obtained, maximum })
    }

    if (!entries.length) {
      alert('No subjects available for this student.')
      return
    }

    const newRecord: ExamRecord = {
      exam: selectedExam,
      entries,
      updatedAt: new Date().toISOString(),
    }

    setStudents(previous =>
      previous.map(s => {
        if (s.id !== marksStudentId) return s

        const otherRecords = (s.marks ?? []).filter(
          record => record.exam !== selectedExam
        )

        return {
          ...s,
          marks: [...otherRecords, newRecord],
        }
      })
    )

    alert(`${selectedExam} marks saved successfully for ${student.name}!`)
  }

  function openMarksForStudent(id: number) {
    setMarksStudentId(id)
    setSelectedExam('FA-1')
    loadMarks(id, 'FA-1')
    setPage('Marks Management')
  }

  // BACKUP DOWNLOAD

  function downloadBackup() {
    const backupData = {
      appName: 'Little Scholars',
      backupVersion: 1,
      exportedAt: new Date().toISOString(),
      students,
    }

    const blob = new Blob(
      [JSON.stringify(backupData, null, 2)],
      { type: 'application/json' }
    )

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = `little-scholars-backup-${new Date()
      .toISOString()
      .slice(0, 10)}.json`

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    setTimeout(() => URL.revokeObjectURL(url), 1000)
    alert('Backup downloaded successfully!')
  }

  // BACKUP RESTORE

  function restoreBackup(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()

    reader.onload = () => {
      try {
        const backup = JSON.parse(String(reader.result))

        if (
          backup.appName !== 'Little Scholars' ||
          !Array.isArray(backup.students)
        ) {
          alert('Invalid Little Scholars backup file.')
          return
        }

        const validStudents = backup.students.every(
          (student: Student) =>
            typeof student.id === 'number' &&
            typeof student.name === 'string' &&
            typeof student.studentClass === 'string'
        )

        if (!validStudents) {
          alert('Backup contains invalid student records.')
          return
        }

        const restoredStudents: Student[] = backup.students.map(
          (student: Student) => ({
            ...student,
            subjects: Array.isArray(student.subjects)
              ? student.subjects
              : defaultSubjects[student.studentClass] ?? [],
            completedDays: Array.isArray(student.completedDays)
              ? student.completedDays
              : [],
            marks: Array.isArray(student.marks)
              ? student.marks
              : [],
          })
        )

        const confirmed = window.confirm(
          'This will replace your current student records. Continue?'
        )

        if (confirmed) {
          setStudents(restoredStudents)
          setSelectedStudentId(null)
          setMarksStudentId(null)
          setMarkInputs({})
          setReportStudentId(null)
          resetForm()
          setPage('Dashboard')
          alert('Backup restored successfully!')
        }
      } catch {
        alert('Unable to read this backup file.')
      } finally {
        event.target.value = ''
      }
    }

    reader.readAsText(file)
  }

  // GENERAL CALCULATIONS

  const selectedStudent = students.find(
    student => student.id === selectedStudentId
  )

  const marksStudent = students.find(
    student => student.id === marksStudentId
  )

  const tenthStudents = students.filter(
    student => student.studentClass === '10th'
  )

  const completedCount = selectedStudent?.completedDays?.length ?? 0
  const pendingCount = 100 - completedCount
  const progressPercentage = completedCount

  const totalCompletedDays = tenthStudents.reduce(
    (total, student) => total + (student.completedDays?.length ?? 0),
    0
  )

  const averageProgress = tenthStudents.length
    ? Math.round(totalCompletedDays / tenthStudents.length)
    : 0

  const savedExamRecords = marksStudent?.marks ?? []

  // REPORT CALCULATIONS

  const reportStudent = students.find(
    student => student.id === reportStudentId
  )

  const reportRecords = exams
    .map(exam =>
      (reportStudent?.marks ?? []).find(record => record.exam === exam)
    )
    .filter((record): record is ExamRecord => record !== undefined)

  const reportExamStats = reportRecords.map(record => {
    const obtained = record.entries.reduce(
      (total, entry) => total + entry.obtained, 0
    )

    const maximum = record.entries.reduce(
      (total, entry) => total + entry.maximum, 0
    )

    return {
      exam: record.exam,
      obtained,
      maximum,
      percentage: maximum > 0 ? (obtained / maximum) * 100 : 0,
    }
  })

  const reportOverallAverage = reportExamStats.length
    ? reportExamStats.reduce(
        (total, result) => total + result.percentage, 0
      ) / reportExamStats.length
    : 0

  const reportBestExam = reportExamStats.length
    ? reportExamStats.reduce((best, current) =>
        current.percentage > best.percentage ? current : best
      )
    : null

  const reportSubjectStats = (reportStudent?.subjects ?? []).map(subject => ({
    subject,
    results: reportRecords
      .map(record => {
        const entry = record.entries.find(item => item.subject === subject)

        return entry
          ? {
              exam: record.exam,
              percentage: (entry.obtained / entry.maximum) * 100,
            }
          : null
      })
      .filter(
        (result): result is { exam: string; percentage: number } =>
          result !== null
      ),
  }))

  const studentsWithMarks = students.filter(
    student => (student.marks ?? []).length > 0
  ).length

  const totalExamRecords = students.reduce(
    (total, student) => total + (student.marks ?? []).length, 0
  )

  // PRINT REPORT

  function printStudentReport() {
    if (!reportStudent || !reportRecords.length) {
      alert('Please select a student with saved examination marks.')
      return
    }

    window.print()
  }

  // CURRENT STUDENT

  const loggedInStudent = students.find(
    student => student.id === loggedInStudentId
  )

  // LOGIN PAGE

  if (!loginRole) {
    return (
      <div className="login-page">
        <div className="login-card">
          <div className="login-logo">📚</div>
          <h1>Little Scholars</h1>
          <p className="login-subtitle">Student Management System</p>

          <div className="login-divider" />

          <h2>Welcome Back!</h2>
          <p>Login to continue</p>

          <form onSubmit={handleLogin}>
            <label htmlFor="loginUsername">Username</label>
            <input
              id="loginUsername"
              type="text"
              value={loginUsername}
              onChange={e => setLoginUsername(e.target.value)}
              placeholder="Enter username"
              autoComplete="username"
              required
            />

            <label htmlFor="loginPassword">Password</label>

            <div className="password-wrapper">
              <input
                id="loginPassword"
                type={showPassword ? 'text' : 'password'}
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                placeholder="Enter password"
                autoComplete="current-password"
                required
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>

            {loginError && (
              <div className="login-error">{loginError}</div>
            )}

            <button type="submit" className="primary-btn login-button">
              Login →
            </button>
          </form>

          <div className="login-footer">
            <strong>LEARN • GROW • SUCCEED</strong>
            <p>© 2026 Little Scholars</p>
          </div>
        </div>
      </div>
    )
  }

  // STUDENT PORTAL

  if (loginRole === 'student') {
    if (!loggedInStudent) {
      return (
        <div className="login-page">
          <div className="login-card">
            <h2>Student Account Unavailable</h2>
            <p>Please contact your administrator.</p>
            <button className="primary-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      )
    }

    const studentMarks = loggedInStudent.marks ?? []
    const studentDays = loggedInStudent.completedDays ?? []

    return (
      <div className="student-portal">
        <header className="portal-header">
          <div>
            <h1>📚 Little Scholars</h1>
            <p>Student Portal</p>
          </div>
          <button className="delete-btn" onClick={handleLogout}>
            Logout
          </button>
        </header>

        <section className="content-card portal-welcome">
          {loggedInStudent.photo ? (
            <img
              className="portal-photo"
              src={loggedInStudent.photo}
              alt={loggedInStudent.name}
            />
          ) : (
            <div className="portal-photo-placeholder">👤</div>
          )}

          <div>
            <h2>Welcome, {loggedInStudent.name}! 👋</h2>
            <p>
              {loggedInStudent.studentClass} · {loggedInStudent.school}
            </p>
            <span className="profile-status">Active Student</span>
          </div>
        </section>

        <section className="stats">
          <div className="stat-card blue">
            <h3>Class</h3>
            <h1>{loggedInStudent.studentClass}</h1>
          </div>

          <div className="stat-card green">
            <h3>Exams Completed</h3>
            <h1>{studentMarks.length}</h1>
          </div>

          {loggedInStudent.studentClass === '10th' && (
            <div className="stat-card purple">
              <h3>Days Completed</h3>
              <h1>{studentDays.length}/100</h1>
            </div>
          )}
        </section>

        <section className="content-card">
          <h2>👤 My Profile</h2>
          <div className="profile-details">
            <div>
              <strong>Student Name</strong>
              <span>{loggedInStudent.name}</span>
            </div>
            <div>
              <strong>Class</strong>
              <span>{loggedInStudent.studentClass}</span>
            </div>
            <div>
              <strong>School / College</strong>
              <span>{loggedInStudent.school}</span>
            </div>
            <div>
              <strong>Parent / Guardian</strong>
              <span>{loggedInStudent.parent}</span>
            </div>
            <div>
              <strong>Subjects</strong>
              <span>{loggedInStudent.subjects.join(', ')}</span>
            </div>
          </div>
        </section>

        <section className="content-card">
          <h2>📝 My Examination Results</h2>

          {studentMarks.length === 0 ? (
            <p>Your examination marks have not been entered yet.</p>
          ) : (
            studentMarks.map(record => {
              const obtained = record.entries.reduce(
                (total, entry) => total + entry.obtained, 0
              )
              const maximum = record.entries.reduce(
                (total, entry) => total + entry.maximum, 0
              )
              const percentage = maximum
                ? (obtained / maximum) * 100
                : 0

              return (
                <div className="backup-section" key={record.exam}>
                  <h3>{record.exam}</h3>
                  <h2>{percentage.toFixed(2)}%</h2>
                  <p>Total: {obtained} / {maximum}</p>

                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Subject</th>
                          <th>Obtained</th>
                          <th>Maximum</th>
                          <th>Percentage</th>
                        </tr>
                      </thead>
                      <tbody>
                        {record.entries.map(entry => (
                          <tr key={entry.subject}>
                            <td>{entry.subject}</td>
                            <td>{entry.obtained}</td>
                            <td>{entry.maximum}</td>
                            <td>
                              {((entry.obtained / entry.maximum) * 100).toFixed(2)}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )
            })
          )}
        </section>

        {loggedInStudent.studentClass === '10th' && (
          <section className="content-card">
            <h2>📅 My 100 Days Programme</h2>

            <div className="stats">
              <div className="stat-card green">
                <h3>Completed</h3>
                <h1>{studentDays.length}</h1>
              </div>
              <div className="stat-card orange">
                <h3>Pending</h3>
                <h1>{100 - studentDays.length}</h1>
              </div>
            </div>

            <div className="progress-bar">
              <div style={{ width: `${studentDays.length}%` }} />
            </div>

            <p>{studentDays.length}% of the programme completed.</p>
          </section>
        )}

        <section className="content-card">
          <h2>📚 My Subjects</h2>
          <div className="subject-list">
            {loggedInStudent.subjects.map((subject, index) => (
              <span key={`${subject}-${index}`}>{subject}</span>
            ))}
          </div>
        </section>

        <p className="portal-footer">
          Little Scholars · Learn • Grow • Succeed
        </p>
      </div>
    )
  }

  // ADMIN DASHBOARD

  return (
    <div className="app">
      <aside className="sidebar">
        <h2>📚 Little Scholars</h2>
        <p className="subtitle">Student Management System</p>

        <nav>
          {[
            'Dashboard',
            'Students',
            '100 Days Tracker',
            'Marks Management',
            'Reports',
            'Settings',
          ].map(item => (
            <button
              key={item}
              className={page === item ? 'active' : ''}
              onClick={() => {
                if (editingId !== null) resetForm()
                setPage(item)
              }}
            >
              {item === 'Dashboard' ? '🏠' :
                item === 'Students' ? '👨‍🎓' :
                item === '100 Days Tracker' ? '📅' :
                item === 'Marks Management' ? '📝' :
                item === 'Reports' ? '📊' : '⚙️'} {item}
            </button>
          ))}
        </nav>

        <div className="admin">
          <h4>Admin Panel</h4>
          <p>Welcome, Admin!</p>
          <button className="delete-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>

      <main className="main">
        <header>
          <div>
            <h1>{page}</h1>
            <p>Welcome to Little Scholars!</p>
          </div>
          <span className="profile">Admin 👤</span>
        </header>

        {/* DASHBOARD */}

        {page === 'Dashboard' && (
          <>
            <section className="stats">
              <div className="stat-card blue">
                <h3>Total Students</h3>
                <h1>{students.length}</h1>
                <p>All registered students</p>
              </div>

              <div className="stat-card green">
                <h3>Completed Days</h3>
                <h1>{totalCompletedDays}</h1>
                <p>10th-class programme</p>
              </div>

              <div className="stat-card orange">
                <h3>Pending Days</h3>
                <h1>
                  {tenthStudents.reduce(
                    (total, student) =>
                      total + (100 - (student.completedDays?.length ?? 0)),
                    0
                  )}
                </h1>
                <p>10th-class programme</p>
              </div>

              <div className="stat-card purple">
                <h3>Average Progress</h3>
                <h1>{averageProgress}%</h1>
                <p>10th-class programme</p>
              </div>
            </section>

            <section className="content-card">
              <h2>Welcome to Little Scholars! 📚</h2>
              <p>
                Manage every tuition student, their subjects and academic progress.
              </p>
              <button
                className="primary-btn"
                onClick={() => setPage('Students')}
              >
                + Register New Student
              </button>
            </section>

            <section className="content-card">
              <h2>100 Days Programme</h2>
              <p>Exclusively for your 10th-class students.</p>
              <button
                className="primary-btn"
                onClick={() => setPage('100 Days Tracker')}
              >
                Open 100 Days Tracker
              </button>
            </section>

            <section className="content-card">
              <h2>📊 Academic Reports</h2>
              <p>Check student examination performance and prepare parent reports.</p>
              <button
                className="primary-btn"
                onClick={() => setPage('Reports')}
              >
                Open Performance Dashboard
              </button>
            </section>
          </>
        )}

        {/* STUDENT MANAGEMENT */}

        {page === 'Students' && (
          <>
            <section className="content-card">
              <h2>
                {editingId !== null
                  ? '✏️ Edit Student Details'
                  : '➕ Register New Student'}
              </h2>

              <p>Register students from 6th class to Inter and Diploma.</p>

              <form onSubmit={addStudent} className="student-form">
                <div className="photo-upload">
                  {photo ? (
                    <img src={photo} alt="Student preview" />
                  ) : (
                    <span>👤</span>
                  )}

                  <label htmlFor="studentPhoto">Upload Student Photo</label>
                  <input
                    id="studentPhoto"
                    type="file"
                    accept="image/*"
                    onChange={handlePhoto}
                  />
                  <small>Image up to 2 MB</small>
                </div>

                <div className="form-grid">
                  <label>
                    Student Name *
                    <input
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Enter student name"
                      required
                    />
                  </label>

                  <label>
                    Class *
                    <select
                      value={studentClass}
                      onChange={e => changeClass(e.target.value)}
                    >
                      {[
                        '6th', '7th', '8th', '9th',
                        '10th', 'Inter', 'Diploma',
                      ].map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </label>

                  <label>
                    School / College Name *
                    <input
                      value={school}
                      onChange={e => setSchool(e.target.value)}
                      placeholder="Enter school or college name"
                      required
                    />
                  </label>

                  <label>
                    Parent / Guardian Name *
                    <input
                      value={parent}
                      onChange={e => setParent(e.target.value)}
                      placeholder="Enter parent name"
                      required
                    />
                  </label>

                  <label>
                    Parent Mobile Number *
                    <input
                      type="tel"
                      value={mobile}
                      onChange={e => setMobile(e.target.value)}
                      placeholder="10-digit mobile number"
                      pattern="[6-9][0-9]{9}"
                      maxLength={10}
                      required
                    />
                  </label>
                </div>

                <div className="subjects-editor">
                  <label htmlFor="subjects">Subjects *</label>
                  <textarea
                    id="subjects"
                    value={subjectsText}
                    onChange={e => setSubjectsText(e.target.value)}
                    placeholder="Enter subjects separated by commas"
                    rows={4}
                    required
                  />
                  <small>
                    Subjects are suggested automatically based on class.
                    You can edit them. Separate subjects with commas.
                  </small>
                </div>

                <button className="primary-btn" type="submit">
                  {editingId !== null ? 'Update Student' : 'Save Student'}
                </button>

                {editingId !== null && (
                  <button
                    type="button"
                    className="delete-btn"
                    onClick={resetForm}
                  >
                    Cancel Editing
                  </button>
                )}
              </form>
            </section>

            <section className="content-card">
              <h2>👨‍🎓 Registered Students ({students.length})</h2>

              {students.length === 0 ? (
                <p>No students registered yet. Add your first student above!</p>
              ) : (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Photo</th>
                        <th>Student Name</th>
                        <th>Class</th>
                        <th>School / College</th>
                        <th>Parent</th>
                        <th>Mobile</th>
                        <th>Login Username</th>
                        <th>Login Password</th>
                        <th>Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {students.map(student => (
                        <tr key={student.id}>
                          <td>
                            {student.photo ? (
                              <img
                                className="student-thumb"
                                src={student.photo}
                                alt={student.name}
                              />
                            ) : '👤'}
                          </td>
                          <td>{student.name}</td>
                          <td>{student.studentClass}</td>
                          <td>{student.school}</td>
                          <td>{student.parent}</td>
                          <td>{student.mobile}</td>
                          <td>
                            <strong>LS{student.id}</strong>
                            <button
                              type="button"
                              className="primary-btn"
                              onClick={() => {
                                navigator.clipboard?.writeText(`LS${student.id}`)
                                alert('Username copied!')
                              }}
                            >
                              Copy
                            </button>
                          </td>
                          <td>
                            <strong>{student.mobile}</strong>
                            <button
                              type="button"
                              className="primary-btn"
                              onClick={() => {
                                navigator.clipboard?.writeText(student.mobile)
                                alert('Password copied!')
                              }}
                            >
                              Copy
                            </button>
                          </td>
                          <td>
                            <button
                              type="button"
                              className="primary-btn"
                              onClick={() => openProfile(student.id)}
                            >
                              Profile
                            </button>
                            <button
                              type="button"
                              className="primary-btn"
                              onClick={() => editStudent(student)}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="delete-btn"
                              onClick={() => deleteStudent(student.id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}

        {/* STUDENT PROFILE */}

        {page === 'Student Profile' && (
          <section className="content-card">
            {selectedStudent ? (
              <>
                <button
                  className="primary-btn"
                  onClick={() => setPage('Students')}
                >
                  ← Back to Students
                </button>

                <div className="student-profile-heading">
                  {selectedStudent.photo ? (
                    <img src={selectedStudent.photo} alt={selectedStudent.name} />
                  ) : (
                    <div className="profile-placeholder">👤</div>
                  )}

                  <div>
                    <h2>{selectedStudent.name}</h2>
                    <p>
                      {selectedStudent.studentClass} · {selectedStudent.school}
                    </p>
                    <span className="profile-status">Active Student</span>
                  </div>
                </div>

                <h3>Personal & Parent Details</h3>

                <div className="profile-details">
                  <div><strong>Student Name</strong><span>{selectedStudent.name}</span></div>
                  <div><strong>Class</strong><span>{selectedStudent.studentClass}</span></div>
                  <div><strong>School / College</strong><span>{selectedStudent.school}</span></div>
                  <div><strong>Parent / Guardian</strong><span>{selectedStudent.parent}</span></div>
                  <div><strong>Parent Mobile</strong><span>{selectedStudent.mobile}</span></div>
                </div>

                <section className="backup-section">
                  <h3>🔐 Student Login Credentials</h3>
                  <p>Share these demo login details with the student.</p>
                  <p><strong>Username:</strong> LS{selectedStudent.id}</p>
                  <p><strong>Password:</strong> {selectedStudent.mobile}</p>
                  <button
                    className="primary-btn"
                    onClick={() => {
                      navigator.clipboard?.writeText(
                        `Little Scholars Login\nUsername: LS${selectedStudent.id}\nPassword: ${selectedStudent.mobile}`
                      )
                      alert('Student login details copied!')
                    }}
                  >
                    Copy Login Details
                  </button>
                </section>

                <h3>📚 Subjects</h3>
                <div className="subject-list">
                  {selectedStudent.subjects.map((subject, index) => (
                    <span key={`${subject}-${index}`}>{subject}</span>
                  ))}
                </div>

                <h3>📝 Academic Marks</h3>
                <p>{(selectedStudent.marks ?? []).length} exam record(s) saved.</p>

                <button
                  className="primary-btn"
                  onClick={() => openMarksForStudent(selectedStudent.id)}
                >
                  Enter / View Student Marks
                </button>

                {(selectedStudent.marks ?? []).length > 0 && (
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Exam</th>
                          <th>Total Obtained</th>
                          <th>Total Maximum</th>
                          <th>Percentage</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(selectedStudent.marks ?? []).map(record => {
                          const obtained = record.entries.reduce(
                            (total, entry) => total + entry.obtained, 0
                          )
                          const maximum = record.entries.reduce(
                            (total, entry) => total + entry.maximum, 0
                          )
                          const percentage = maximum
                            ? (obtained / maximum) * 100
                            : 0

                          return (
                            <tr key={record.exam}>
                              <td>{record.exam}</td>
                              <td>{obtained}</td>
                              <td>{maximum}</td>
                              <td>{percentage.toFixed(2)}%</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                <button
                  className="primary-btn"
                  onClick={() => {
                    setReportStudentId(selectedStudent.id)
                    setPage('Reports')
                  }}
                >
                  📊 View Performance Report
                </button>

                {selectedStudent.studentClass === '10th' && (
                  <>
                    <h3>📅 100 Days Programme</h3>
                    <div className="profile-progress">
                      <strong>
                        {selectedStudent.completedDays?.length ?? 0}% completed
                      </strong>
                      <div className="progress-bar">
                        <div
                          style={{
                            width: `${selectedStudent.completedDays?.length ?? 0}%`,
                          }}
                        />
                      </div>
                    </div>
                    <button
                      className="primary-btn"
                      onClick={() => setPage('100 Days Tracker')}
                    >
                      Open 100 Days Tracker
                    </button>
                  </>
                )}

                <div className="profile-actions">
                  <button
                    className="primary-btn"
                    onClick={() => editStudent(selectedStudent)}
                  >
                    Edit Student Details
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2>No student selected</h2>
                <button
                  className="primary-btn"
                  onClick={() => setPage('Students')}
                >
                  Go to Students
                </button>
              </>
            )}
          </section>
        )}

        {/* 100 DAYS TRACKER */}

        {page === '100 Days Tracker' && (
          <>
            <section className="content-card">
              <h2>📅 10th Class - 100 Days Programme</h2>
              <p>Only 10th-class students are eligible for this programme.</p>

              {tenthStudents.length === 0 ? (
                <p>Please register a 10th-class student first.</p>
              ) : (
                <label>
                  Select 10th Class Student
                  <select
                    value={
                      selectedStudent?.studentClass === '10th'
                        ? selectedStudentId ?? ''
                        : ''
                    }
                    onChange={e =>
                      setSelectedStudentId(
                        e.target.value ? Number(e.target.value) : null
                      )
                    }
                  >
                    <option value="">-- Choose a student --</option>
                    {tenthStudents.map(student => (
                      <option key={student.id} value={student.id}>
                        {student.name} - {student.studentClass}
                      </option>
                    ))}
                  </select>
                </label>
              )}
            </section>

            {selectedStudent && selectedStudent.studentClass === '10th' && (
              <>
                <section className="content-card">
                  <h2>{selectedStudent.name}'s Progress</h2>
                  <div className="stats">
                    <div className="stat-card green">
                      <h3>Completed</h3>
                      <h1>{completedCount}</h1>
                    </div>
                    <div className="stat-card orange">
                      <h3>Pending</h3>
                      <h1>{pendingCount}</h1>
                    </div>
                    <div className="stat-card blue">
                      <h3>Progress</h3>
                      <h1>{progressPercentage}%</h1>
                    </div>
                  </div>
                  <div className="progress-bar">
                    <div style={{ width: `${progressPercentage}%` }} />
                  </div>
                  <p>{completedCount} out of 100 days completed.</p>
                </section>

                <section className="content-card">
                  <h2>Mark Daily Completion</h2>
                  <p>Click a day to mark it completed. Click again to undo.</p>
                  <div className="day-grid">
                    {Array.from({ length: 100 }, (_, index) => {
                      const day = index + 1
                      const isCompleted = (
                        selectedStudent.completedDays ?? []
                      ).includes(day)

                      return (
                        <button
                          key={day}
                          type="button"
                          className={`day-btn ${isCompleted ? 'completed' : ''}`}
                          onClick={() => toggleDay(selectedStudent.id, day)}
                          aria-label={`Day ${day} ${isCompleted ? 'completed' : 'pending'}`}
                          aria-pressed={isCompleted}
                        >
                          {isCompleted ? '✓' : day}
                        </button>
                      )
                    })}
                  </div>
                </section>
              </>
            )}
          </>
        )}

        {/* MARKS MANAGEMENT */}

        {page === 'Marks Management' && (
          <>
            <section className="content-card">
              <h2>📝 Individual Student Marks Entry</h2>
              <p>
                Select one student and enter their marks for each examination.
              </p>

              {students.length === 0 ? (
                <p>Please register a student before entering marks.</p>
              ) : (
                <>
                  <div className="form-grid">
                    <label>
                      Select Student *
                      <select
                        value={marksStudentId ?? ''}
                        onChange={e =>
                          chooseMarksStudent(
                            e.target.value ? Number(e.target.value) : null
                          )
                        }
                      >
                        <option value="">-- Choose a student --</option>
                        {students.map(student => (
                          <option key={student.id} value={student.id}>
                            {student.name} - {student.studentClass}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label>
                      Select Examination *
                      <select
                        value={selectedExam}
                        onChange={e => chooseExam(e.target.value)}
                      >
                        {exams.map(exam => (
                          <option key={exam} value={exam}>{exam}</option>
                        ))}
                      </select>
                    </label>
                  </div>

                  {marksStudent && (
                    <>
                      <div className="content-card">
                        <h3>Student Details</h3>
                        <p><strong>Name:</strong> {marksStudent.name}</p>
                        <p><strong>Class:</strong> {marksStudent.studentClass}</p>
                        <p><strong>School / College:</strong> {marksStudent.school}</p>
                        <p><strong>Examination:</strong> {selectedExam}</p>
                      </div>

                      <h3>Enter Subject-wise Marks</h3>
                      <p>For example, 18 out of 20.</p>

                      <div className="table-wrap">
                        <table>
                          <thead>
                            <tr>
                              <th>Subject</th>
                              <th>Obtained Marks</th>
                              <th>Maximum Marks</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.keys(markInputs).map(subject => (
                              <tr key={subject}>
                                <td>{subject}</td>
                                <td>
                                  <input
                                    type="number"
                                    min="0"
                                    step="any"
                                    placeholder="Obtained"
                                    value={markInputs[subject].obtained}
                                    onChange={e =>
                                      updateMark(subject, 'obtained', e.target.value)
                                    }
                                  />
                                </td>
                                <td>
                                  <input
                                    type="number"
                                    min="0.01"
                                    step="any"
                                    placeholder="Maximum"
                                    value={markInputs[subject].maximum}
                                    onChange={e =>
                                      updateMark(subject, 'maximum', e.target.value)
                                    }
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <button
                        className="primary-btn"
                        type="button"
                        onClick={saveMarks}
                      >
                        💾 Save / Update Marks
                      </button>
                    </>
                  )}
                </>
              )}
            </section>

            {marksStudent && (
              <section className="content-card">
                <h2>📊 {marksStudent.name}'s Exam History</h2>

                {savedExamRecords.length === 0 ? (
                  <p>No examination marks saved yet.</p>
                ) : (
                  savedExamRecords.map(record => {
                    const obtained = record.entries.reduce(
                      (total, entry) => total + entry.obtained, 0
                    )
                    const maximum = record.entries.reduce(
                      (total, entry) => total + entry.maximum, 0
                    )
                    const percentage = maximum
                      ? (obtained / maximum) * 100
                      : 0

                    return (
                      <div className="backup-section" key={record.exam}>
                        <h3>{record.exam}</h3>
                        <div className="table-wrap">
                          <table>
                            <thead>
                              <tr>
                                <th>Subject</th>
                                <th>Obtained</th>
                                <th>Maximum</th>
                                <th>Percentage</th>
                              </tr>
                            </thead>
                            <tbody>
                              {record.entries.map(entry => (
                                <tr key={entry.subject}>
                                  <td>{entry.subject}</td>
                                  <td>{entry.obtained}</td>
                                  <td>{entry.maximum}</td>
                                  <td>
                                    {((entry.obtained / entry.maximum) * 100).toFixed(2)}%
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot>
                              <tr>
                                <th>Total</th>
                                <th>{obtained}</th>
                                <th>{maximum}</th>
                                <th>{percentage.toFixed(2)}%</th>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                        <p>
                          Last updated: {new Date(record.updatedAt).toLocaleString()}
                        </p>
                        <button
                          type="button"
                          className="primary-btn"
                          onClick={() => chooseExam(record.exam)}
                        >
                          Edit {record.exam} Marks
                        </button>
                      </div>
                    )
                  })
                )}
              </section>
            )}
          </>
        )}

        {/* REPORTS */}

        {page === 'Reports' && (
          <>
            <section className="stats">
              <div className="stat-card blue">
                <h3>Total Students</h3>
                <h1>{students.length}</h1>
                <p>Registered students</p>
              </div>
              <div className="stat-card green">
                <h3>Students With Marks</h3>
                <h1>{studentsWithMarks}</h1>
                <p>Students with exam records</p>
              </div>
              <div className="stat-card orange">
                <h3>Total Exam Records</h3>
                <h1>{totalExamRecords}</h1>
                <p>Saved examination records</p>
              </div>
              <div className="stat-card purple">
                <h3>Available Exams</h3>
                <h1>{exams.length}</h1>
                <p>FA-1 to SA-2</p>
              </div>
            </section>

            <section className="content-card">
              <h2>📊 Individual Performance Analysis</h2>
              <p>Select a student to compare examination results.</p>

              <label className="report-select-label">
                Select Student
                <select
                  value={reportStudentId ?? ''}
                  onChange={e =>
                    setReportStudentId(
                      e.target.value ? Number(e.target.value) : null
                    )
                  }
                >
                  <option value="">-- Choose a student --</option>
                  {students.map(student => (
                    <option key={student.id} value={student.id}>
                      {student.name} - {student.studentClass}
                    </option>
                  ))}
                </select>
              </label>

              {!reportStudent && (
                <p className="muted-note">
                  Select a student to view academic performance.
                </p>
              )}

              {reportStudent && reportRecords.length === 0 && (
                <p className="muted-note">
                  No examination marks saved for {reportStudent.name} yet.
                </p>
              )}

              {reportStudent && reportRecords.length > 0 && (
                <>
                  <div className="report-student-summary">
                    {reportStudent.photo ? (
                      <img src={reportStudent.photo} alt={reportStudent.name} />
                    ) : (
                      <div className="profile-placeholder">👤</div>
                    )}
                    <div>
                      <h3>{reportStudent.name}</h3>
                      <p>{reportStudent.studentClass} · {reportStudent.school}</p>
                      <p>Parent: {reportStudent.parent}</p>
                    </div>
                  </div>

                  <div className="report-dashboard-grid">
                    <div className="report-metric">
                      <span>Average Percentage</span>
                      <strong>{reportOverallAverage.toFixed(2)}%</strong>
                    </div>
                    <div className="report-metric">
                      <span>Exams Completed</span>
                      <strong>{reportRecords.length} / {exams.length}</strong>
                    </div>
                    <div className="report-metric">
                      <span>Best Examination</span>
                      <strong>
                        {reportBestExam
                          ? `${reportBestExam.exam} (${reportBestExam.percentage.toFixed(1)}%)`
                          : '—'}
                      </strong>
                    </div>
                  </div>

                  <div className="report-section">
                    <h3>📈 Examination Performance Comparison</h3>
                    <div className="performance-bars">
                      {reportExamStats.map(result => (
                        <div className="performance-row" key={result.exam}>
                          <div className="performance-label">
                            <strong>{result.exam}</strong>
                            <span>{result.percentage.toFixed(2)}%</span>
                          </div>
                          <div className="bar-track">
                            <div
                              className="bar-fill"
                              style={{
                                width: `${Math.min(100, result.percentage)}%`,
                              }}
                            />
                          </div>
                          <small>{result.obtained} / {result.maximum} marks</small>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="report-section">
                    <h3>📚 Subject-wise Performance</h3>
                    {reportSubjectStats.map(item => (
                      <div className="subject-performance" key={item.subject}>
                        <h4>{item.subject}</h4>
                        {item.results.length === 0 ? (
                          <p>No marks entered for this subject.</p>
                        ) : (
                          item.results.map(result => (
                            <div
                              className="subject-result"
                              key={`${item.subject}-${result.exam}`}
                            >
                              <span>{result.exam}</span>
                              <div className="bar-track">
                                <div
                                  className="bar-fill subject-bar"
                                  style={{
                                    width: `${Math.min(100, result.percentage)}%`,
                                  }}
                                />
                              </div>
                              <strong>{result.percentage.toFixed(1)}%</strong>
                            </div>
                          ))
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="report-section">
                    <h3>📋 Examination Summary</h3>
                    <div className="table-wrap">
                      <table>
                        <thead>
                          <tr>
                            <th>Examination</th>
                            <th>Obtained</th>
                            <th>Maximum</th>
                            <th>Percentage</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reportExamStats.map(result => (
                            <tr key={result.exam}>
                              <td>{result.exam}</td>
                              <td>{result.obtained}</td>
                              <td>{result.maximum}</td>
                              <td>{result.percentage.toFixed(2)}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <button className="primary-btn" onClick={printStudentReport}>
                    📄 Download Student Report PDF
                  </button>
                  <p className="muted-note">
                    Choose Save as PDF in the print window.
                  </p>
                </>
              )}
            </section>

            {/* PRINTABLE REPORT */}

            {reportStudent && reportRecords.length > 0 && (
              <section className="print-report-area">
                <div className="print-report-header">
                  <h1>LITTLE SCHOLARS</h1>
                  <p>STUDENT ACADEMIC PROGRESS REPORT</p>
                  <p>Academic Year: 2026–2027</p>
                </div>

                <div className="print-student-details">
                  {reportStudent.photo && (
                    <img src={reportStudent.photo} alt={reportStudent.name} />
                  )}
                  <div>
                    <h2>{reportStudent.name}</h2>
                    <p><strong>Class:</strong> {reportStudent.studentClass}</p>
                    <p><strong>School / College:</strong> {reportStudent.school}</p>
                    <p><strong>Parent / Guardian:</strong> {reportStudent.parent}</p>
                    <p><strong>Parent Mobile:</strong> {reportStudent.mobile}</p>
                  </div>
                </div>

                <h3>Examination Performance Summary</h3>
                <div className="table-wrap">
                  <table className="report-table">
                    <thead>
                      <tr>
                        <th>Exam</th>
                        <th>Obtained</th>
                        <th>Maximum</th>
                        <th>Percentage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportExamStats.map(result => (
                        <tr key={result.exam}>
                          <td>{result.exam}</td>
                          <td>{result.obtained}</td>
                          <td>{result.maximum}</td>
                          <td>{result.percentage.toFixed(2)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <h3>Subject-wise Marks Details</h3>
                <div className="table-wrap">
                  <table className="report-table">
                    <thead>
                      <tr>
                        <th>Examination</th>
                        <th>Subject</th>
                        <th>Obtained</th>
                        <th>Maximum</th>
                        <th>Percentage</th>
                      </tr>
                    </thead>
                    {reportRecords.map(record => (
                      <tbody key={record.exam}>
                        {record.entries.map(entry => (
                          <tr key={`${record.exam}-${entry.subject}`}>
                            <td>{record.exam}</td>
                            <td>{entry.subject}</td>
                            <td>{entry.obtained}</td>
                            <td>{entry.maximum}</td>
                            <td>
                              {((entry.obtained / entry.maximum) * 100).toFixed(2)}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    ))}
                  </table>
                </div>

                <div className="print-overall-result">
                  <h3>Overall Performance</h3>
                  <p>
                    Average:
                    <strong> {reportOverallAverage.toFixed(2)}%</strong>
                  </p>
                  {reportBestExam && (
                    <p>
                      Best examination:
                      <strong>
                        {' '}{reportBestExam.exam} ({reportBestExam.percentage.toFixed(2)}%)
                      </strong>
                    </p>
                  )}
                </div>

                <div className="teacher-remarks">
                  <h3>Teacher's Remarks</h3>
                  <p>__________________________________________________________</p>
                  <p>__________________________________________________________</p>
                </div>

                <div className="report-signatures">
                  <div>
                    Parent's Signature
                    <span>________________________</span>
                  </div>
                  <div>
                    Teacher's Signature
                    <span>________________________</span>
                  </div>
                </div>

                <p className="report-footer">
                  Little Scholars · Student Academic Progress Report
                </p>
              </section>
            )}
          </>
        )}

        {/* SETTINGS */}

        {page === 'Settings' && (
          <section className="content-card">
            <h2>⚙️ Settings</h2>
            <p>Manage and protect your Little Scholars data.</p>

            <div className="backup-section">
              <h3>📥 Download Student Backup</h3>
              <p>
                Download all student records, photos, subjects, marks and
                100 Days Programme progress.
              </p>
              <button className="primary-btn" onClick={downloadBackup}>
                Download Backup
              </button>
            </div>

            <div className="backup-section">
              <h3>📤 Restore Student Backup</h3>
              <p>Select a previously downloaded backup file.</p>
              <input
                type="file"
                accept=".json,application/json"
                onChange={restoreBackup}
              />
              <small>Warning: Restoring replaces your current student list.</small>
            </div>

            <div className="backup-section">
              <h3>🔒 Demo Login Information</h3>
              <p><strong>Admin Username:</strong> admin</p>
              <p><strong>Admin Password:</strong> LS@12345</p>
              <p>
                Student username: LS followed by their student ID.
              </p>
              <p>
                Student password: Registered parent mobile number.
              </p>
              <p>
                This is a temporary browser-based demo login, not secure
                production authentication.
              </p>
            </div>

            <div className="backup-section">
              <h3>Data Protection</h3>
              <p>
                Download backups regularly and keep copies in two
                separate places, such as your laptop and Google Drive.
              </p>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}

export default App