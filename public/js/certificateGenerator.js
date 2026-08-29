class CertificateGenerator {
    static generateCertificate(studentName, courseName) {
        return {
            id: 'CERT-' + Date.now(),
            studentName,
            courseName,
            issueDate: new Date().toLocaleDateString(),
            verificationUrl: https://edunova.edu/verify/CERT-\
        };
    }
}
if (typeof module !== 'undefined') module.exports = CertificateGenerator;