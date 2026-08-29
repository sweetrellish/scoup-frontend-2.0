import { CheckCircle2, Circle, TrendingUp } from "lucide-react";

interface ProfileCompletionWidgetProps {
  profilePhoto: string;
  formData: {
    firstName: string;
    lastName: string;
    email: string;
    department: string;
    title: string;
    phone: string;
    officeLocation: string;
    bio: string;
    researchInterests: string;
    personalWebsite: string;
  };
  qualifications: unknown[];
  keywords: unknown[];
}

export function ProfileCompletionWidget({ 
  profilePhoto, 
  formData, 
  qualifications, 
  keywords 
}: ProfileCompletionWidgetProps) {
  const completionChecks = [
    {
      label: "Profile Photo",
      completed: profilePhoto !== "",
      weight: 10,
    },
    {
      label: "Basic Information",
      completed: formData.firstName && formData.lastName && formData.email && formData.department && formData.title,
      weight: 15,
    },
    {
      label: "Contact Details",
      completed: formData.phone && formData.officeLocation,
      weight: 10,
    },
    {
      label: "Biography",
      completed: formData.bio && formData.bio.length > 50,
      weight: 20,
    },
    {
      label: "Research Interests",
      completed: formData.researchInterests && formData.researchInterests.length > 20,
      weight: 15,
    },
    {
      label: "Qualifications",
      completed: qualifications.length > 0,
      weight: 15,
    },
    {
      label: "Keywords (min 3)",
      completed: keywords.length >= 3,
      weight: 10,
    },
    {
      label: "Personal Website",
      completed: formData.personalWebsite !== "",
      weight: 5,
    },
  ];

  const totalWeight = completionChecks.reduce((sum, check) => sum + check.weight, 0);
  const completedWeight = completionChecks
    .filter(check => check.completed)
    .reduce((sum, check) => sum + check.weight, 0);
  
  const completionPercentage = Math.round((completedWeight / totalWeight) * 100);
  const completedCount = completionChecks.filter(check => check.completed).length;

  const getCompletionColor = () => {
    if (completionPercentage >= 80) return "text-green-600";
    if (completionPercentage >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const getProgressBarColor = () => {
    if (completionPercentage >= 80) return "from-green-600 to-green-500";
    if (completionPercentage >= 50) return "from-yellow-600 to-yellow-500";
    return "from-red-600 to-red-500";
  };

  return (
    <div className="bg-white rounded-lg border-2 border-[#8b0000] p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-[#8b0000] to-[#6b0000] rounded-lg flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-[#ffd100]" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Profile Completion</h3>
          <p className="text-sm text-gray-600">
            {completedCount} of {completionChecks.length} sections complete
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Overall Progress</span>
          <span className={`text-2xl font-light ${getCompletionColor()}`}>
            {completionPercentage}%
          </span>
        </div>
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${getProgressBarColor()} transition-all duration-500 rounded-full`}
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Completion Checklist */}
      <div className="space-y-2">
        {completionChecks.map((check) => (
          <div 
            key={check.label}
            className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0"
          >
            {check.completed ? (
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
            ) : (
              <Circle className="w-5 h-5 text-gray-300 flex-shrink-0" />
            )}
            <div className="flex-1 flex items-center justify-between">
              <span className={`text-sm ${check.completed ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                {check.label}
              </span>
              <span className="text-xs text-gray-500">{check.weight}%</span>
            </div>
          </div>
        ))}
      </div>

      {/* Completion Message */}
      {completionPercentage === 100 ? (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-700 font-medium">
            🎉 Excellent! Your profile is 100% complete!
          </p>
        </div>
      ) : completionPercentage >= 80 ? (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-700">
            Almost there! Complete the remaining sections to maximize your visibility.
          </p>
        </div>
      ) : (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">
            Complete your profile to increase your chances of being discovered by potential collaborators.
          </p>
        </div>
      )}
    </div>
  );
}