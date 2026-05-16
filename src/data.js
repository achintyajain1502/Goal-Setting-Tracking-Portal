export const USERS = {
  employee: { name: 'Arjun Sharma',  role: 'Employee',     dept: 'Sales', id: 'emp1', color: '#4f7cff', initials: 'AS' },
  manager:  { name: 'Priya Menon',   role: 'Manager (L1)', dept: 'Sales', id: 'mgr1', color: '#22c87a', initials: 'PM' },
  admin:    { name: 'Rahul Gupta',   role: 'Admin / HR',   dept: 'HR',    id: 'adm1', color: '#9b6dff', initials: 'RG' },
};

export const NAV = {
  employee: [
    { id: 'dashboard',  icon: '📊', label: 'Dashboard' },
    { id: 'my-goals',   icon: '🎯', label: 'My Goals'  },
    { id: 'checkin',    icon: '📋', label: 'Check-ins' },
  ],
  manager: [
    { id: 'dashboard',    icon: '📊', label: 'Dashboard'   },
    { id: 'team-goals',   icon: '👥', label: 'Team Goals'  },
    { id: 'approvals',    icon: '✅', label: 'Approvals'   },
    { id: 'checkin-mgr',  icon: '📋', label: 'Check-ins'   },
    { id: 'shared-goals', icon: '🔗', label: 'Shared Goals'},
  ],
  admin: [
    { id: 'dashboard',  icon: '📊', label: 'Dashboard'   },
    { id: 'all-goals',  icon: '🎯', label: 'All Goals'   },
    { id: 'audit',      icon: '🔍', label: 'Audit Log'   },
    { id: 'reports',    icon: '📄', label: 'Reports'     },
    { id: 'cycle-mgmt', icon: '⚙️', label: 'Cycle Mgmt' },
  ],
};

export const THRUST_AREAS = [
  'Revenue Growth', 'Customer Success', 'Process Excellence',
  'Learning & Development', 'Compliance', 'Innovation',
];

export const INITIAL_GOALS = [
  { id:1,  emp:'Arjun Sharma', empId:'emp1', thrust:'Revenue Growth',        title:'Achieve Q1 Sales Target',      desc:'Close deals to hit ₹50L sales target for Q1',               uom:'Min',      target:50,           unit:'Lakhs', weightage:30, status:'Approved', quarter:'Q1', actual:38,          checkStatus:'On Track',    managerComment:'Good progress, keep it up', locked:true,  shared:false, sharedFrom:null },
  { id:2,  emp:'Arjun Sharma', empId:'emp1', thrust:'Customer Success',       title:'Increase NPS Score',           desc:'Improve net promoter score from 62 to 75',                  uom:'Min',      target:75,           unit:'Score', weightage:20, status:'Approved', quarter:'Q1', actual:68,          checkStatus:'On Track',    managerComment:'',                          locked:true,  shared:false, sharedFrom:null },
  { id:3,  emp:'Arjun Sharma', empId:'emp1', thrust:'Process Excellence',     title:'Reduce Deal Closure TAT',      desc:'Bring average deal closure from 18 days to 12 days',        uom:'Max',      target:12,           unit:'Days',  weightage:20, status:'Approved', quarter:'Q1', actual:14,          checkStatus:'On Track',    managerComment:'',                          locked:true,  shared:false, sharedFrom:null },
  { id:4,  emp:'Arjun Sharma', empId:'emp1', thrust:'Compliance',             title:'Zero Compliance Incidents',    desc:'Ensure zero compliance violations in all deals',            uom:'Zero',     target:0,            unit:'Count', weightage:15, status:'Approved', quarter:'Q1', actual:0,           checkStatus:'Completed',   managerComment:'Excellent',                 locked:true,  shared:true,  sharedFrom:'Priya Menon' },
  { id:5,  emp:'Arjun Sharma', empId:'emp1', thrust:'Learning & Development', title:'Complete Sales Certification', desc:'Complete Salesforce CRM certification by June',             uom:'Timeline', target:'2025-06-30', unit:'Date',  weightage:15, status:'Approved', quarter:'Q1', actual:'2025-06-15', checkStatus:'On Track',    managerComment:'',                          locked:true,  shared:false, sharedFrom:null },
  { id:6,  emp:'Neha Patel',   empId:'emp2', thrust:'Revenue Growth',        title:'Achieve Q1 Sales Target',      desc:'Close ₹40L in new business',                                uom:'Min',      target:40,           unit:'Lakhs', weightage:35, status:'Approved', quarter:'Q1', actual:28,          checkStatus:'Not Started', managerComment:'',                          locked:true,  shared:false, sharedFrom:null },
  { id:7,  emp:'Neha Patel',   empId:'emp2', thrust:'Compliance',             title:'Zero Compliance Incidents',    desc:'Ensure zero compliance violations',                         uom:'Zero',     target:0,            unit:'Count', weightage:25, status:'Approved', quarter:'Q1', actual:0,           checkStatus:'Completed',   managerComment:'',                          locked:true,  shared:true,  sharedFrom:'Priya Menon' },
  { id:8,  emp:'Neha Patel',   empId:'emp2', thrust:'Customer Success',       title:'Client Retention Rate',        desc:'Maintain 90% client retention',                             uom:'Min',      target:90,           unit:'%',     weightage:40, status:'Approved', quarter:'Q1', actual:85,          checkStatus:'On Track',    managerComment:'',                          locked:true,  shared:false, sharedFrom:null },
  { id:9,  emp:'Rohit Kumar',  empId:'emp3', thrust:'Revenue Growth',        title:'Pipeline Development',         desc:'Build pipeline worth ₹1.2Cr',                               uom:'Min',      target:120,          unit:'Lakhs', weightage:40, status:'Pending',  quarter:'Q1', actual:null,        checkStatus:'Not Started', managerComment:'',                          locked:false, shared:false, sharedFrom:null },
  { id:10, emp:'Rohit Kumar',  empId:'emp3', thrust:'Process Excellence',     title:'CRM Data Hygiene',             desc:'Ensure 95% CRM data accuracy',                              uom:'Min',      target:95,           unit:'%',     weightage:35, status:'Pending',  quarter:'Q1', actual:null,        checkStatus:'Not Started', managerComment:'',                          locked:false, shared:false, sharedFrom:null },
  { id:11, emp:'Rohit Kumar',  empId:'emp3', thrust:'Learning & Development', title:'Product Knowledge',            desc:'Score 85%+ in product quiz',                                uom:'Min',      target:85,           unit:'%',     weightage:25, status:'Pending',  quarter:'Q1', actual:null,        checkStatus:'Not Started', managerComment:'',                          locked:false, shared:false, sharedFrom:null },
];

export const INITIAL_AUDIT = [
  { time:'2025-05-01 09:30', user:'Priya Menon',          action:'Approved goals for Arjun Sharma (IDs: 1,2,3,4,5)' },
  { time:'2025-05-01 10:15', user:'Priya Menon',          action:'Pushed shared goal "Zero Compliance Incidents" to Arjun Sharma and Neha Patel' },
  { time:'2025-05-03 14:22', user:'Arjun Sharma',         action:'Submitted Q1 actual achievement for Goal #1 (Revenue: 38 Lakhs)' },
  { time:'2025-05-05 11:10', user:'Priya Menon',          action:'Added check-in comment for Arjun Sharma — Goal #1' },
  { time:'2025-05-10 09:05', user:'Rahul Gupta (Admin)',  action:'Unlocked Goal #3 for Arjun Sharma for revision' },
];

export const SCHEDULE = [
  { period:'Goal Setting',   window:'1st May',      action:'Goal Creation, Submission & Approval', status:'done'   },
  { period:'Q1 Check-in',    window:'July',         action:'Progress Update — Planned vs. Actual', status:'active' },
  { period:'Q2 Check-in',    window:'October',      action:'Progress Update — Planned vs. Actual', status:''       },
  { period:'Q3 Check-in',    window:'January',      action:'Progress Update — Planned vs. Actual', status:''       },
  { period:'Q4 / Annual',    window:'March / April',action:'Final Achievement Capture',             status:''       },
];
