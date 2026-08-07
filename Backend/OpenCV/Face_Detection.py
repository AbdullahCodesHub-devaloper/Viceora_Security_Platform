import cv2
import os
import numpy as np

face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
)

recognizer = cv2.face.LBPHFaceRecognizer_create()

faces = []
labels = []
names = {}
label_id = 0

faces_dir = os.path.join(os.path.dirname(__file__), "Faces")

for filename in os.listdir(faces_dir):
    path = os.path.join(faces_dir, filename)

    image = cv2.imread(path)

    if image is None:
        continue

    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    detected_faces = face_cascade.detectMultiScale(
        gray,
        scaleFactor=1.1,
        minNeighbors=5,
        minSize=(80, 80)
    )

    for (x, y, w, h) in detected_faces:
        faces.append(gray[y:y+h, x:x+w])
        labels.append(label_id)

    name = os.path.splitext(filename)[0]
    names[label_id] = name
    label_id += 1

if not faces:
    print("No training faces found.")
    exit()

recognizer.train(faces, np.array(labels))

camera = cv2.VideoCapture(0)

if not camera.isOpened():
    print("Cannot open camera.")
    exit()

while True:
    ret, frame = camera.read()

    if not ret:
        break

    frame = cv2.flip(frame, 1)

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    detected_faces = face_cascade.detectMultiScale(
        gray,
        scaleFactor=1.1,
        minNeighbors=5,
        minSize=(80, 80)
    )

    for (x, y, w, h) in detected_faces:
        face = gray[y:y+h, x:x+w]

        label, confidence = recognizer.predict(face)

        if confidence < 70:
            name = names[label]
            status = f"{name} - Known"
        else:
            name = "Unknown"
            status = "Unknown"

        cv2.rectangle(
            frame,
            (x, y),
            (x + w, y + h),
            (0, 255, 0),
            2
        )

        cv2.putText(
            frame,
            status,
            (x, y - 10),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.8,
            (0, 255, 0),
            2
        )

    cv2.imshow("Vicora Face Recognition", frame)

    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

camera.release()
cv2.destroyAllWindows()