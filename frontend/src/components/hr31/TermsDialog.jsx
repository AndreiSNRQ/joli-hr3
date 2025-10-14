import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export default function TermsDialog({ open, onOpenChange }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <div>
      <DialogContent className="min-w-[60%] h-[80vh] overflow-y-auto">
        <DialogTitle className="font-bold text-2xl">Terms and Conditions</DialogTitle>
        <p className="text-sm font-semibold">Date: <span className="text-gray-600">August 19, 2025</span></p>
            <DialogHeader className="font-semibold pt-3">1. Preamble and Purpose</DialogHeader>
            <DialogDescription>
                This agreement defines the roles, responsibilities, and obligations of the Administrator of the Travel and Tours HR3 System. The system leverages AI-driven leave processing and intelligent shift scheduling to optimize workforce management in the travel and tours industry. Administrators are entrusted with safeguarding sensitive employee and company data, configuring modules, and ensuring compliance with both internal security rules and government regulations.
            </DialogDescription>
            <DialogHeader className="font-semibold">2. Definitions</DialogHeader>
            <DialogDescription>
                <ol>
                    <li className="list-disc">System (Platform): The Travel and Tours HR3 with AI Leave Processing & Shift Scheduling.</li>
                    <li className="list-disc">Manager: An individual authorized to oversee and manage a team's operations within the system.</li>
                    <li className="list-disc">Confidential Information: This includes employee profiles, leave requests, schedules, shift records, and other sensitive team- related information.</li>
                    <li className="list-disc">AI Scheduling Optimizer: The system component that generates conflict-free schedules for the team based on business rules and employee availability.</li>
                    <li className="list-disc">spaCy NLP Module: The AI component that interprets and processes natural-language leave requests.</li>
                </ol>
            </DialogDescription>

            <DialogHeader className="font-semibold">3. Scope of Access and Core Responsibilities</DialogHeader>
            <DialogDescription>
                Managers have elevated privileges that allow them to manage their teams within the system. Their core responsibilities include:
                <DialogHeader className="font-semibold pt-3">Leave Request Processing:</DialogHeader>
                <DialogDescription>
                    <ol>
                        <li className="list-disc">Review and approve or deny leave requests from their direct reports.</li>
                        <li className="list-disc">Ensure leave approvals align with blackout periods and company policy.</li>
                        <li className="list-disc">Escalate complex or conflicting requests to the Administrator for review.</li>
                    </ol>
                </DialogDescription>

                <DialogHeader className="font-semibold pt-3">Shift Scheduling Oversight:</DialogHeader>
                <DialogDescription>
                    <ol>
                        <li className="list-disc">Monitor and adjust schedules for their team, ensuring adequate coverage.</li>
                        <li className="list-disc">Communicate with the AI Scheduling Optimizer to make minor adjustments or overrides as needed for emergencies or special circumstances.</li>
                        <li className="list-disc">Ensure team members are not overworked by monitoring workload and rest periods.</li>
                    </ol>
                </DialogDescription>

                <DialogHeader className="font-semibold pt-3">Performance and Reporting:</DialogHeader>
                <DialogDescription>
                    <ol>
                        <li className="list-disc">Generate and review team-specific reports on attendance, leave trends, and shift compliance.</li>
                        <li className="list-disc">Provide feedback to the Administrator on system performance and potential issues.</li>
                    </ol>
                </DialogDescription>
            </DialogDescription>

            <DialogHeader className="font-semibold pt-3">4. Confidentiality and Data Handling Mandate</DialogHeader>
            <DialogDescription>
                Managers must safeguard all team-related data and ensure its proper handling. You are responsible for:
                <ol className="pt-3">
                    <li className="list-disc">Handling employee information with strict confidentiality.</li>
                    <li className="list-disc">Preventing unauthorized viewing, sharing, or disclosure of sensitive team data, including personal details, leave history, or payroll information.</li>
                    <li className="list-disc">Preventing unauthorized viewing, sharing, or disclosure of sensitive team data, including personal details, leave history, or payroll information.</li>
                </ol>
            </DialogDescription>

            <DialogHeader className="font-semibold pt-3">5.	System Usage and Prohibitions</DialogHeader>
            <DialogDescription>
                Managers are expected to use the system responsibly and are strictly prohibited from:
                <ol className="pt-3">
                    <li className="list-disc">Granting system access or sharing credentials with unauthorized individuals.</li>
                    <li className="list-disc">Altering their own personal, scheduling, or payroll information.</li>
                    <li className="list-disc">Attempting to	modify system logic	or bypass established workflows.</li>
                    <li className="list-disc">Exploiting administrative privileges for personal or financial gain.</li>
                </ol>
            </DialogDescription>

            <DialogHeader className="font-semibold pt-3">5.	Acknowledgment of Agreement</DialogHeader>
            <DialogDescription>
                By accessing the system, you acknowledge and agree to abide by the responsibilities and conditions outlined in this agreement. You confirm that you have read and understood the scope of your access, the importance of maintaining confidentiality, and the prohibitions on system use. You accept that any violation of these terms may result in disciplinary action, including the immediate revocation of your access rights and other consequences as determined by company policy.
            </DialogDescription>
      </DialogContent>
      </div>
    </Dialog>
  );
}