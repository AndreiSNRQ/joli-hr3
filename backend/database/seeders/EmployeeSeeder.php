<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class EmployeeSeeder extends Seeder
{
    public function run()
    {
        $now = Carbon::now();

        DB::table('employees')->insert([
            // HR Department
            ['name' => 'Anna Dela Cruz', 'email' => 'anna.hr@example.com', 'position' => 'HR Officer', 'department' => 'HR', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Mark Santos', 'email' => 'mark.hr@example.com', 'position' => 'HR Assistant', 'department' => 'HR', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Jessa Ramos', 'email' => 'jessa.hr@example.com', 'position' => 'Recruitment Specialist', 'department' => 'HR', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Leo Garcia', 'email' => 'leo.hr@example.com', 'position' => 'HR Coordinator', 'department' => 'HR', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Carla Mendoza', 'email' => 'carla.hr@example.com', 'position' => 'HR Analyst', 'department' => 'HR', 'created_at' => $now, 'updated_at' => $now],

            // IT Department
            ['name' => 'John Reyes', 'email' => 'john.it@example.com', 'position' => 'System Administrator', 'department' => 'IT', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Paolo Lim', 'email' => 'paolo.it@example.com', 'position' => 'Software Engineer', 'department' => 'IT', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Diane Cruz', 'email' => 'diane.it@example.com', 'position' => 'Frontend Developer', 'department' => 'IT', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Miguel Tan', 'email' => 'miguel.it@example.com', 'position' => 'Backend Developer', 'department' => 'IT', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Ella Torres', 'email' => 'ella.it@example.com', 'position' => 'QA Tester', 'department' => 'IT', 'created_at' => $now, 'updated_at' => $now],

            // Accounting Department
            ['name' => 'Josefina Bautista', 'email' => 'josefina.acc@example.com', 'position' => 'Accounting Clerk', 'department' => 'Accounting', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Rico Villanueva', 'email' => 'rico.acc@example.com', 'position' => 'Auditor', 'department' => 'Accounting', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Sarah Go', 'email' => 'sarah.acc@example.com', 'position' => 'Bookkeeper', 'department' => 'Accounting', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'James Uy', 'email' => 'james.acc@example.com', 'position' => 'Financial Analyst', 'department' => 'Accounting', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Nina Cruz', 'email' => 'nina.acc@example.com', 'position' => 'Payroll Officer', 'department' => 'Accounting', 'created_at' => $now, 'updated_at' => $now],

            // Marketing Department
            ['name' => 'Allan Perez', 'email' => 'allan.mkt@example.com', 'position' => 'Marketing Manager', 'department' => 'Marketing', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Bea Lopez', 'email' => 'bea.mkt@example.com', 'position' => 'Social Media Specialist', 'department' => 'Marketing', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Clint Ramos', 'email' => 'clint.mkt@example.com', 'position' => 'Graphic Designer', 'department' => 'Marketing', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Trisha Lim', 'email' => 'trisha.mkt@example.com', 'position' => 'Content Writer', 'department' => 'Marketing', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Ivan Ong', 'email' => 'ivan.mkt@example.com', 'position' => 'SEO Analyst', 'department' => 'Marketing', 'created_at' => $now, 'updated_at' => $now],

            // Operations Department
            ['name' => 'Katrina Dizon', 'email' => 'katrina.ops@example.com', 'position' => 'Operations Manager', 'department' => 'Operations', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Benjie Castro', 'email' => 'benjie.ops@example.com', 'position' => 'Logistics Coordinator', 'department' => 'Operations', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Rhea Sison', 'email' => 'rhea.ops@example.com', 'position' => 'Inventory Officer', 'department' => 'Operations', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Paul Navarro', 'email' => 'paul.ops@example.com', 'position' => 'Procurement Staff', 'department' => 'Operations', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Hazel Gutierrez', 'email' => 'hazel.ops@example.com', 'position' => 'Operations Analyst', 'department' => 'Operations', 'created_at' => $now, 'updated_at' => $now],
        ]);
    }
}
