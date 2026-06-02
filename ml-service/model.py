import numpy as np
from sklearn.ensemble import RandomForestClassifier, GradientBoostingRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, r2_score
import joblib
import os
import json

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'model.joblib')
SCALER_PATH = os.path.join(os.path.dirname(__file__), 'scaler.joblib')

SKILL_CATEGORIES = {
    'critical': {'python', 'java', 'javascript', 'sql', 'data structures', 'algorithms', 'system design', 'machine learning', 'deep learning', 'react', 'node.js', 'docker', 'kubernetes', 'aws', 'git', 'rest api', 'database management'},
    'important': {'html', 'css', 'typescript', 'c++', 'go', 'rust', 'mongodb', 'postgresql', 'redis', 'graphql', 'tensorflow', 'pytorch', 'linux', 'ci/cd', 'agile', 'scrum', 'oop'},
    'nice': {'flutter', 'swift', 'kotlin', 'vue.js', 'angular', 'express.js', 'fastapi', 'django', 'spring boot', 'numpy', 'pandas', 'tableau', 'power bi', 'excel', 'photoshop', 'figma'}
}

def _generate_synthetic_data(n_samples=5000):
    np.random.seed(42)
    n = n_samples

    cgpa = np.clip(np.random.normal(7.5, 1.2, n), 5.0, 10.0)
    num_skills = np.random.randint(0, 16, n)
    num_projects = np.random.poisson(3, n)
    num_internships = np.random.poisson(1.2, n)
    num_certs = np.random.poisson(2, n)
    github_repos = np.random.poisson(8, n)
    comm_score = np.clip(np.random.normal(65, 18, n), 10, 100)
    tech_score = np.clip(np.random.normal(60, 20, n), 10, 100)

    skills_quality = np.zeros(n)
    for idx in range(n):
        ks = min(num_skills[idx], 15)
        rand_skills = _get_random_skills(ks)
        critical = len(rand_skills & SKILL_CATEGORIES['critical'])
        important = len(rand_skills & SKILL_CATEGORIES['important'])
        nice = len(rand_skills & SKILL_CATEGORIES['nice'])
        skills_quality[idx] = critical * 3 + important * 2 + nice * 1

    base_score = (
        (cgpa - 5) / 5 * 25 +
        np.minimum(skills_quality / 15, 1) * 20 +
        np.minimum(num_projects / 5, 1) * 15 +
        np.minimum(num_internships / 3, 1) * 15 +
        np.minimum(num_certs / 5, 1) * 10 +
        np.minimum(github_repos / 20, 1) * 10 +
        comm_score / 100 * 10 +
        tech_score / 100 * 15
    ) * 2.5

    noise = np.random.normal(0, 8, n)
    prob = np.clip(base_score + noise, 5, 100)

    placed = (prob >= 65).astype(int)
    soft_placed = (prob >= 55).astype(int)

    X = np.column_stack([cgpa, num_skills, skills_quality, num_projects,
                         num_internships, num_certs, github_repos,
                         comm_score, tech_score])

    return X, prob, placed, soft_placed


def _get_random_skills(k):
    all_skills = set()
    for cat in SKILL_CATEGORIES.values():
        all_skills |= cat
    all_skills = list(all_skills)
    idx = np.random.choice(len(all_skills), size=min(k, len(all_skills)), replace=False)
    return {all_skills[i] for i in idx}


def train():
    X, prob, placed, soft_placed = _generate_synthetic_data(5000)

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    clf = RandomForestClassifier(
        n_estimators=200, max_depth=12, min_samples_leaf=5,
        random_state=42, class_weight='balanced'
    )
    clf.fit(X_scaled, placed)

    reg = GradientBoostingRegressor(
        n_estimators=150, max_depth=5, learning_rate=0.1, random_state=42
    )
    reg.fit(X_scaled, prob)

    X_train, X_test, y_train, y_test = train_test_split(
        X_scaled, placed, test_size=0.2, random_state=42
    )
    acc = accuracy_score(y_test, clf.predict(X_test))

    _, _, prob_test, _ = train_test_split(
        X_scaled, prob, test_size=0.2, random_state=42
    )
    r2 = r2_score(prob_test, reg.predict(X_test))

    joblib.dump({'classifier': clf, 'regressor': reg}, MODEL_PATH)
    joblib.dump(scaler, SCALER_PATH)

    return {'accuracy': float(acc), 'r2': float(r2), 'samples': 5000}


def load():
    if not os.path.exists(MODEL_PATH):
        result = train()
    models = joblib.load(MODEL_PATH)
    scaler = joblib.load(SCALER_PATH)
    return models['classifier'], models['regressor'], scaler


def predict(features):
    clf, reg, scaler = load()
    required = ['cgpa', 'num_skills', 'skills_quality', 'num_projects',
                'num_internships', 'num_certs', 'github_repos',
                'comm_score', 'tech_score']
    for k in required:
        if k not in features:
            raise ValueError(f'Missing feature: {k}')

    X = np.array([[features[k] for k in required]])
    X_scaled = scaler.transform(X)

    prob = float(reg.predict(X_scaled)[0])
    prob = max(0, min(100, prob))
    placed = bool(clf.predict(X_scaled)[0])

    return {
        'placement_probability': round(prob, 1),
        'predicted_placed': placed,
        'confidence': 'High' if placed else 'Medium'
    }


if __name__ == '__main__':
    result = train()
    print(json.dumps(result, indent=2))
    print('Model trained and saved.')
