from PyQt5 import QtCore, QtGui, QtWidgets
from PyQt5.QtWidgets import QApplication, QMainWindow, QFileDialog, QTextEdit, QAction
import os


class Ui_MainWindow(object):

    path_name = ''
    counter = 0
    files = []

    def setupUi(self, MainWindow):
        MainWindow.setObjectName("MainWindow")
        MainWindow.resize(1920, 1080)
        self.centralwidget = QtWidgets.QWidget(MainWindow)
        self.centralwidget.setObjectName("centralwidget")

        self.image = QtWidgets.QLabel(self.centralwidget)
        self.image.setGeometry(QtCore.QRect(20, 10, 1248, 846))
        self.image.setText("")
        self.image.setPixmap(QtGui.QPixmap(""))
        self.image.setScaledContents(True)
        self.image.setObjectName("image")
        self.image.resize(QtGui.QPixmap("").width(),
                          QtGui.QPixmap("").height())

        self.btn_upload = QtWidgets.QPushButton(self.centralwidget)
        self.btn_upload.setGeometry(QtCore.QRect(20, 886, 140, 70))
        self.btn_upload.setObjectName("btn_upload")

        self.btn_previous = QtWidgets.QPushButton(self.centralwidget)
        self.btn_previous.setGeometry(QtCore.QRect(320, 886, 140, 70))
        self.btn_previous.setObjectName("btn_previous")

        self.btn_next = QtWidgets.QPushButton(self.centralwidget)
        self.btn_next.setGeometry(QtCore.QRect(490, 886, 140, 70))
        self.btn_next.setObjectName("btn_next")

        self.btn_reset = QtWidgets.QPushButton(self.centralwidget)
        self.btn_reset.setGeometry(QtCore.QRect(958, 886, 140, 70))
        self.btn_reset.setObjectName("btn_reset")

        self.btn_submit = QtWidgets.QPushButton(self.centralwidget)
        self.btn_submit.setGeometry(QtCore.QRect(1128, 886, 140, 70))
        self.btn_submit.setObjectName("btn_submit")

        MainWindow.setCentralWidget(self.centralwidget)

        self.menubar = QtWidgets.QMenuBar(MainWindow)
        self.menubar.setGeometry(QtCore.QRect(0, 0, 830, 18))
        self.menubar.setObjectName("menubar")
        self.menuFile = QtWidgets.QMenu(self.menubar)
        self.menuFile.setObjectName("menuFile")
        MainWindow.setMenuBar(self.menubar)
        self.statusbar = QtWidgets.QStatusBar(MainWindow)
        self.statusbar.setObjectName("statusbar")
        MainWindow.setStatusBar(self.statusbar)
        self.btn_open = QtWidgets.QAction(MainWindow)
        self.btn_open.setObjectName("btn_open")
        self.menuFile.addAction(self.btn_open)
        self.menubar.addAction(self.menuFile.menuAction())

        self.retranslateUi(MainWindow)
        QtCore.QMetaObject.connectSlotsByName(MainWindow)

        self.btn_open.triggered.connect(self.open_folder)
        self.btn_upload.clicked.connect(self.open_folder)
        self.btn_previous.clicked.connect(self.previous_image)
        self.btn_next.clicked.connect(self.next_image)
        self.btn_reset.clicked.connect(self.reset_path)

    def retranslateUi(self, MainWindow):
        _translate = QtCore.QCoreApplication.translate
        MainWindow.setWindowTitle(_translate("MainWindow", "Annotation Tool"))
        self.btn_upload.setText(_translate("MainWindow", "Upload"))
        self.btn_previous.setText(_translate("MainWindow", "Previous"))
        self.btn_next.setText(_translate("MainWindow", "Next"))
        self.btn_reset.setText(_translate("MainWindow", "Reset"))
        self.btn_submit.setText(_translate("MainWindow", "Submit"))
        self.menuFile.setTitle(_translate("MainWindow", "File"))
        self.btn_open.setText(_translate("MainWindow", "Open"))
        self.btn_open.setStatusTip(_translate("MainWindow", "Open a folder"))
        self.btn_open.setShortcut(_translate("MainWindow", "Ctrl+O"))

    def open_folder(self):
        try:
            self.path_name = QFileDialog.getExistingDirectory(
                None, 'Select a folder:', 'C:\\', QFileDialog.ShowDirsOnly) + '/'
            self.image.setPixmap(QtGui.QPixmap(self.path_name + '0.jpeg'))

            path = self.path_name
            files = self.files
            for r, d, f in os.walk(path):
                for file in f:
                    if '.jpeg' in file:
                        files.append(os.path.join(r, file))

            self.image.setPixmap(QtGui.QPixmap(files[self.counter]))
            width = QtGui.QPixmap(files[self.counter]).width()
            height = QtGui.QPixmap(files[self.counter]).height()
            if width > 1248:
                width = 1248
            if height > 846:
                height = 846

            self.image.resize(width, height)

        except Exception as e:
            print(e)

    def previous_image(self):
        files = self.files

        if self.counter > 0:
            self.counter = self.counter - 1
            self.image.setPixmap(QtGui.QPixmap(files[self.counter]))

            width = QtGui.QPixmap(files[self.counter]).width()
            height = QtGui.QPixmap(files[self.counter]).height()
            if width > 1248:
                width = 1248
            if height > 846:
                height = 846

            self.image.resize(width, height)

    def next_image(self):
        files = self.files

        if self.counter < len(files) - 1:
            self.counter = self.counter + 1
            self.image.setPixmap(QtGui.QPixmap(files[self.counter]))
            width = QtGui.QPixmap(files[self.counter]).width()
            height = QtGui.QPixmap(files[self.counter]).height()
            if width > 1248:
                width = 1248
            if height > 846:
                height = 846

            self.image.resize(width, height)

    def reset_path(self):
        self.path_name = ''
        self.image.setPixmap(QtGui.QPixmap(""))
        self.counter = 0


if __name__ == "__main__":
    import sys
    app = QtWidgets.QApplication(sys.argv)
    MainWindow = QtWidgets.QMainWindow()
    ui = Ui_MainWindow()
    ui.setupUi(MainWindow)
    MainWindow.show()
    sys.exit(app.exec_())
