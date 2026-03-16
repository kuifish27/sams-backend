import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, SafeAreaView, ScrollView
} from "react-native";
import axios from "axios";

const api = axios.create({
  baseURL: "http://192.168.68.104:5000/api",
});

export default function App() {
  const [screen, setScreen] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [student, setStudent] = useState(null);
  const [attendance, setAttendance] = useState([]);

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please enter email and password.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/students/login", { email, password });
      localStorage.setItem("studentToken", res.data.token);
      localStorage.setItem("studentData", JSON.stringify(res.data.student));
      setStudent(res.data.student);

      // Fetch attendance
      const attRes = await api.get(`/students/${res.data.student.id}/attendance`, {
        headers: { Authorization: `Bearer ${res.data.token}` }
      });
      setAttendance(attRes.data);
      setScreen("dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("studentToken");
    localStorage.removeItem("studentData");
    setStudent(null);
    setAttendance([]);
    setEmail("");
    setPassword("");
    setScreen("login");
  };

  // LOGIN SCREEN
  if (screen === "login") {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.card}>
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoText}>S</Text>
            </View>
            <Text style={styles.logoName}>StudeX</Text>
          </View>

          <Text style={styles.title}>Student Login</Text>
          <Text style={styles.subtitle}>Sign in to view your attendance</Text>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor="#6b7280"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor="#6b7280"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // DASHBOARD SCREEN
  if (screen === "dashboard") {
    const present = attendance.filter(a => a.status === "present").length;
    const absent = attendance.filter(a => a.status === "absent").length;
    const late = attendance.filter(a => a.status === "late").length;
    const notifications = attendance.filter(a => a.status === "absent" || a.status === "late");

    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>

          {/* HEADER */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <Text style={styles.logoText}>S</Text>
              </View>
              <Text style={styles.logoName}>StudeX</Text>
            </View>
            <TouchableOpacity onPress={handleLogout}>
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>

          {/* WELCOME */}
          <View style={styles.welcomeBox}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>
                {student?.name ? student.name[0].toUpperCase() : "S"}
              </Text>
            </View>
            <View>
              <Text style={styles.welcomeTitle}>Welcome, {student?.name}!</Text>
              <Text style={styles.welcomeSub}>{student?.email}</Text>
              <Text style={styles.welcomeSub}>ID: {student?.studentId?.slice(0, 8)}...</Text>
            </View>
          </View>

          {/* STATS */}
          <Text style={styles.sectionTitle}>Attendance Summary</Text>
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { borderColor: "#22c55e" }]}>
              <Text style={[styles.statNumber, { color: "#22c55e" }]}>{present}</Text>
              <Text style={styles.statLabel}>Present</Text>
            </View>
            <View style={[styles.statCard, { borderColor: "#ef4444" }]}>
              <Text style={[styles.statNumber, { color: "#ef4444" }]}>{absent}</Text>
              <Text style={styles.statLabel}>Absent</Text>
            </View>
            <View style={[styles.statCard, { borderColor: "#eab308" }]}>
              <Text style={[styles.statNumber, { color: "#eab308" }]}>{late}</Text>
              <Text style={styles.statLabel}>Late</Text>
            </View>
          </View>

          {/* NOTIFICATIONS */}
          {notifications.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>⚠️ Alerts</Text>
              {notifications.slice(0, 5).map((a) => (
                <View key={a.id} style={styles.alertCard}>
                  <Text style={styles.alertTitle}>
                    {a.status === "absent" ? "❌ Absent" : "⚠️ Late"} — {a.course?.name}
                  </Text>
                  <Text style={styles.alertDate}>
                    {new Date(a.date).toLocaleDateString()}
                  </Text>
                </View>
              ))}
            </>
          )}

          {/* ATTENDANCE HISTORY */}
          <Text style={styles.sectionTitle}>Attendance History</Text>
          {attendance.length === 0 ? (
            <Text style={styles.emptyText}>No attendance records yet.</Text>
          ) : (
            attendance.slice(0, 10).map((a) => (
              <View key={a.id} style={styles.attendanceRow}>
                <View>
                  <Text style={styles.attendanceCourse}>{a.course?.name}</Text>
                  <Text style={styles.attendanceDate}>
                    {new Date(a.date).toLocaleDateString()}
                  </Text>
                </View>
                <View style={[styles.statusBadge,
                  a.status === "present" ? styles.badgePresent :
                  a.status === "absent" ? styles.badgeAbsent :
                  styles.badgeLate
                ]}>
                  <Text style={styles.statusText}>{a.status}</Text>
                </View>
              </View>
            ))
          )}

        </ScrollView>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#06061a" },
  scrollContent: { padding: 20 },
  card: {
    backgroundColor: "#0d0d2b",
    borderRadius: 16,
    padding: 28,
    width: "100%",
    maxWidth: 400,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    marginTop: 80,
    alignSelf: "center",
  },
  logoContainer: { flexDirection: "row", alignItems: "center", marginBottom: 24 },
  logoCircle: {
    height: 36, width: 36, borderRadius: 18,
    backgroundColor: "#2563eb",
    justifyContent: "center", alignItems: "center", marginRight: 8,
  },
  logoText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  logoName: { color: "#60a5fa", fontWeight: "bold", fontSize: 18 },
  title: { color: "#fff", fontSize: 24, fontWeight: "bold", marginBottom: 6 },
  subtitle: { color: "#9ca3af", fontSize: 14, marginBottom: 24 },
  errorBox: {
    backgroundColor: "rgba(239,68,68,0.2)",
    borderWidth: 1, borderColor: "#f87171",
    borderRadius: 8, padding: 10, marginBottom: 16,
  },
  errorText: { color: "#fca5a5", fontSize: 12 },
  inputGroup: { marginBottom: 16 },
  label: { color: "#d1d5db", fontSize: 12, marginBottom: 6 },
  input: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 8, paddingHorizontal: 14, paddingVertical: 10,
    color: "#fff", fontSize: 14,
  },
  button: {
    backgroundColor: "#2563eb", borderRadius: 8,
    paddingVertical: 12, alignItems: "center", marginTop: 8,
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 15 },
  header: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 20,
  },
  logoutText: { color: "#ef4444", fontSize: 14, fontWeight: "bold" },
  welcomeBox: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#0d0d2b", borderRadius: 12,
    padding: 16, marginBottom: 20,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.1)",
  },
  avatarCircle: {
    height: 48, width: 48, borderRadius: 24,
    backgroundColor: "#2563eb",
    justifyContent: "center", alignItems: "center", marginRight: 12,
  },
  avatarText: { color: "#fff", fontWeight: "bold", fontSize: 20 },
  welcomeTitle: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  welcomeSub: { color: "#9ca3af", fontSize: 12, marginTop: 2 },
  sectionTitle: {
    color: "#fff", fontWeight: "bold",
    fontSize: 14, marginBottom: 10, marginTop: 10,
  },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  statCard: {
    flex: 1, backgroundColor: "#0d0d2b",
    borderRadius: 10, padding: 14,
    alignItems: "center", borderWidth: 1,
  },
  statNumber: { fontSize: 28, fontWeight: "bold" },
  statLabel: { color: "#9ca3af", fontSize: 12, marginTop: 4 },
  alertCard: {
    backgroundColor: "rgba(239,68,68,0.1)",
    borderWidth: 1, borderColor: "rgba(239,68,68,0.3)",
    borderRadius: 10, padding: 12, marginBottom: 8,
  },
  alertTitle: { color: "#fca5a5", fontWeight: "bold", fontSize: 13 },
  alertDate: { color: "#9ca3af", fontSize: 11, marginTop: 2 },
  attendanceRow: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", backgroundColor: "#0d0d2b",
    borderRadius: 10, padding: 12, marginBottom: 8,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.05)",
  },
  attendanceCourse: { color: "#fff", fontWeight: "bold", fontSize: 13 },
  attendanceDate: { color: "#9ca3af", fontSize: 11, marginTop: 2 },
  statusBadge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  badgePresent: { backgroundColor: "rgba(34,197,94,0.2)" },
  badgeAbsent: { backgroundColor: "rgba(239,68,68,0.2)" },
  badgeLate: { backgroundColor: "rgba(234,179,8,0.2)" },
  statusText: { color: "#fff", fontSize: 11, fontWeight: "bold", textTransform: "capitalize" },
  emptyText: { color: "#6b7280", fontSize: 13, textAlign: "center", marginTop: 20 },
});